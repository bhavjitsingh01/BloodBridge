import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/blood-supply-map', analyticsController.getBloodSupplyMap);
router.get('/blood-demand-map', analyticsController.getBloodDemandMap);
router.get('/donation-trends', analyticsController.getDonationTrends);
router.get('/expiry-statistics', analyticsController.getExpiryStatistics);
router.get('/transfer-history', analyticsController.getTransferHistoryTrends);
router.get('/hospital/:hospitalId', analyticsController.getHospitalAnalytics);
router.get('/blood-bank/:bankId', analyticsController.getBloodBankAnalytics);

export default router;
