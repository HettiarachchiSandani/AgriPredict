from django.test import TestCase
from predictions.models import Prediction
from batches.models import Batch, Breed
from datetime import date

class PredictionModelTest(TestCase):

    def setUp(self):
        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer"
        )

        self.batch = Batch.objects.create(
            batchname="Test Batch",
            breed=self.breed,
            startdate=date.today(),
            initial_male=10,
            initial_female=20
        )

    def test_prediction_creation(self):
        prediction = Prediction.objects.create(
            batchid=self.batch,
            predictedeggcount=100,
            predictedfeedrequirement=12.5,
            predicted_mortality=0.02,
            input_features={"temperature": 30}
        )

        self.assertIsNotNone(prediction.predictionid)
        self.assertTrue(prediction.predictionid.startswith("PRE"))
        self.assertEqual(prediction.predictedeggcount, 100)

    def test_prediction_auto_increment(self):
        p1 = Prediction.objects.create(batchid=self.batch)
        p2 = Prediction.objects.create(batchid=self.batch)

        self.assertEqual(p1.predictionid, "PRE001")
        self.assertEqual(p2.predictionid, "PRE002")

    def test_prediction_str(self):
        prediction = Prediction.objects.create(batchid=self.batch)
        self.assertEqual(str(prediction), f"Prediction {prediction.predictionid}")

    def test_prediction_fields(self):
        prediction = Prediction.objects.create(
            batchid=self.batch,
            predictedeggcount=50,
            predictedfeedrequirement=5.25,
            predicted_mortality=0.01,
            input_features={"humidity": 60}
        )

        self.assertEqual(prediction.predictedeggcount, 50)
        self.assertEqual(float(prediction.predictedfeedrequirement), 5.25)
        self.assertEqual(float(prediction.predicted_mortality), 0.01)
        self.assertEqual(prediction.input_features["humidity"], 60)