# ML artifacts

Place trained scikit-learn models here:

- `transaction_classifier.joblib` — merchant/text classifier used by `src/services/ml.service.js`
- `anomaly_detector.joblib` — spending anomaly detector

Until those files are trained and copied in, Cashlytics falls back to heuristic categorization and baseline-ratio anomaly scoring.
