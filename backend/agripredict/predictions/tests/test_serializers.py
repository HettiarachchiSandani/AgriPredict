from django.test import TestCase
from predictions.serializers import PredictionSerializer
from predictions.models import Prediction
from batches.models import Batch, Breed
from datetime import date

class PredictionSerializerTest(TestCase):

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

    def test_serializer_valid_data(self):
        data = {
            "batchid": self.batch.pk,
            "predictedeggcount": 100,
            "predictedfeedrequirement": 10.5,
            "predicted_mortality": 0.02,
            "input_features": {"temp": 30}
        }

        serializer = PredictionSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        prediction = serializer.save()

        self.assertIsNotNone(prediction.predictionid)
        self.assertEqual(prediction.predictedeggcount, 100)

    def test_serializer_output(self):
        prediction = Prediction.objects.create(
            batchid=self.batch,
            predictedeggcount=200
        )

        serializer = PredictionSerializer(prediction)

        self.assertIn("predictionid", serializer.data)
        self.assertEqual(serializer.data["predictedeggcount"], 200)

    def test_missing_required_fields(self):
        data = {
            "predictedeggcount": 50
        }

        serializer = PredictionSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("batchid", serializer.errors)