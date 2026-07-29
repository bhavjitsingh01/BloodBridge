import BloodInventory, { IBloodInventory } from '../models/BloodInventory';
import Hospital from '../models/Hospital';
import { NotFoundError, ValidationError } from '../utils/errors';
import { BLOOD_VALIDITY_DAYS, EXPIRY_ALERT_DAYS } from '../config/constants';
import { addDays, subtractDays } from '../utils/dateUtils';

interface AddBloodInput {
  facilityId: string;
  bloodGroup: string;
  quantity: number;
  batchNumber: string;
  collectionDate: Date;
}

interface UpdateBloodInput {
  availableUnits?: number;
  reservedUnits?: number;
}

export class BloodInventoryService {
  /**
   * Add blood units to inventory
   */
  static async addBlood(input: AddBloodInput): Promise<IBloodInventory> {
    const expiryDate = addDays(input.collectionDate, BLOOD_VALIDITY_DAYS);

    // Find or create inventory
    let inventory = await BloodInventory.findOne({
      facility: input.facilityId,
      bloodGroup: input.bloodGroup,
    });

    if (!inventory) {
      inventory = await BloodInventory.create({
        facility: input.facilityId,
        bloodGroup: input.bloodGroup,
      });
    }

    // Add units
    inventory.units.push({
      batchNumber: input.batchNumber,
      collectionDate: input.collectionDate,
      expiryDate,
      quantity: input.quantity,
      status: 'available',
    });

    inventory.totalUnits += input.quantity;
    inventory.availableUnits += input.quantity;
    inventory.lastUpdated = new Date();

    await inventory.save();
    return inventory;
  }

  /**
   * Get inventory for a facility
   */
  static async getFacilityInventory(facilityId: string): Promise<IBloodInventory[]> {
    const inventory = await BloodInventory.find({ facility: facilityId });
    return inventory;
  }

  /**
   * Update inventory
   */
  static async updateInventory(inventoryId: string, input: UpdateBloodInput): Promise<IBloodInventory> {
    const inventory = await BloodInventory.findById(inventoryId);

    if (!inventory) {
      throw new NotFoundError('Inventory');
    }

    if (input.availableUnits !== undefined) {
      inventory.availableUnits = input.availableUnits;
    }

    if (input.reservedUnits !== undefined) {
      inventory.reservedUnits = input.reservedUnits;
    }

    inventory.totalUnits = inventory.availableUnits + inventory.reservedUnits;
    inventory.lastUpdated = new Date();

    await inventory.save();
    return inventory;
  }

  /**
   * Reserve blood units
   */
  static async reserveBlood(facilityId: string, bloodGroup: string, units: number): Promise<IBloodInventory> {
    const inventory = await BloodInventory.findOne({
      facility: facilityId,
      bloodGroup,
    });

    if (!inventory) {
      throw new NotFoundError('Inventory');
    }

    if (inventory.availableUnits < units) {
      throw new ValidationError('Insufficient blood units available');
    }

    inventory.availableUnits -= units;
    inventory.reservedUnits += units;
    inventory.lastUpdated = new Date();

    await inventory.save();
    return inventory;
  }

  /**
   * Release reserved blood
   */
  static async releaseBlood(facilityId: string, bloodGroup: string, units: number): Promise<IBloodInventory> {
    const inventory = await BloodInventory.findOne({
      facility: facilityId,
      bloodGroup,
    });

    if (!inventory) {
      throw new NotFoundError('Inventory');
    }

    if (inventory.reservedUnits < units) {
      throw new ValidationError('Cannot release more units than reserved');
    }

    inventory.reservedUnits -= units;
    inventory.availableUnits += units;
    inventory.lastUpdated = new Date();

    await inventory.save();
    return inventory;
  }

  /**
   * Get blood units expiring soon
   */
  static async getExpiringBlood(days: number = EXPIRY_ALERT_DAYS): Promise<IBloodInventory[]> {
    const expiryDate = addDays(new Date(), days);

    const inventory = await BloodInventory.find({
      'units.expiryDate': {
        $lte: expiryDate,
        $gte: new Date(),
      },
      'units.status': 'available',
    });

    return inventory;
  }

  /**
   * Get low stock facilities
   */
  static async getLowStockInventory(): Promise<IBloodInventory[]> {
    const inventory = await BloodInventory.find({
      $expr: {
        $lte: ['$availableUnits', '$lowLevel'],
      },
    }).populate('facility', 'name email phone');

    return inventory;
  }

  /**
   * Transfer blood between facilities
   */
  static async transferBlood(
    fromFacilityId: string,
    toFacilityId: string,
    bloodGroup: string,
    units: number
  ): Promise<{ from: IBloodInventory; to: IBloodInventory }> {
    // Get source inventory
    const sourceInventory = await BloodInventory.findOne({
      facility: fromFacilityId,
      bloodGroup,
    });

    if (!sourceInventory || sourceInventory.availableUnits < units) {
      throw new ValidationError('Insufficient blood units at source facility');
    }

    // Get or create destination inventory
    let destInventory = await BloodInventory.findOne({
      facility: toFacilityId,
      bloodGroup,
    });

    if (!destInventory) {
      destInventory = await BloodInventory.create({
        facility: toFacilityId,
        bloodGroup,
      });
    }

    // Update inventories
    sourceInventory.availableUnits -= units;
    sourceInventory.totalUnits -= units;
    sourceInventory.lastUpdated = new Date();

    destInventory.availableUnits += units;
    destInventory.totalUnits += units;
    destInventory.lastUpdated = new Date();

    await Promise.all([sourceInventory.save(), destInventory.save()]);

    return { from: sourceInventory, to: destInventory };
  }

  /**
   * Remove expired blood
   */
  static async removeExpiredBlood(): Promise<number> {
    const now = new Date();
    const inventory = await BloodInventory.find({ 'units.expiryDate': { $lt: now } });

    let expiredCount = 0;

    for (const inv of inventory) {
      inv.units = inv.units.filter((unit) => {
        if (unit.expiryDate < now) {
          expiredCount += unit.quantity;
          return false;
        }
        return true;
      });

      inv.totalUnits -= expiredCount;
      inv.availableUnits -= expiredCount;
      await inv.save();
    }

    return expiredCount;
  }
}
