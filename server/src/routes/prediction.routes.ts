import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/blood-shortage', predictionController.getShortageWarnings);
router.get('/demand-forecast', predictionController.forecastDemand);
router.get('/supply-forecast', predictionController.predictShortage);
router.get('/expiry-risk', predictionController.getExpiryRiskAnalysis);
router.get('/redistribution', predictionController.getRedistributionRecommendations);
router.get('/accuracy', predictionController.getPredictionAccuracy);
router.get('/hospital/:facilityId', authMiddleware, predictionController.getFacilityForecast);

export default router;
