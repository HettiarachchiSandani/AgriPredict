from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date

from batches.models import Batch, Breed, DailyOperations
from reports.models import Report, Records
from reports.serializers import ReportSerializer, RecordSerializer

User = get_user_model()


class SerializerTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="test123"
        )

        self.breed = Breed.objects.create(
            breedid="BR001",
            breedname="Layer"
        )

        self.batch = Batch.objects.create(
            batchid="BAT001",
            batchname="Batch Test",
            breed=self.breed,
            startdate=date.today(),
            initialcount=100,
            currentcount=100
        )

        self.operation = DailyOperations.objects.create(
            batch=self.batch,
            date=date.today(),
            eggcount=50,
            feedusage=10,
            male_mortality=1,
            female_mortality=1,
            mortalitycount=2,
            entered_by=self.user
        )

        self.report = Report.objects.create(
            batchid=self.batch,
            type="Egg Report",
            generatedby=self.user,
            filepath="/reports/test.pdf"
        )

        self.record = Records.objects.create(
            operationid=self.operation,
            batchid=self.batch,
            hashvalue="hash123",
            previoushash="hash000"
        )

        self.operation.refresh_from_db()
        self.record.refresh_from_db()

    def test_report_serializer(self):
        serializer = ReportSerializer(self.report)

        data = serializer.data

        self.assertEqual(data["type"], "Egg Report")
        self.assertEqual(data["generatedby"], str(self.user))  
        self.assertIn("reportid", data)

    def test_record_serializer(self):
        serializer = RecordSerializer(self.record)

        data = serializer.data

        self.assertEqual(data["hashvalue"], "hash123")
        self.assertEqual(data["previoushash"], "hash000")

        self.assertEqual(data["batch_name"], self.batch.batchname)
        self.assertEqual(data["operation_date"], str(self.operation.date))

        self.assertEqual(data["entered_by_name"], self.user.email)

        self.assertIn("recordsid", data)
        self.assertIn("timestamp", data)

    def test_record_serializer_fields(self):
        serializer = RecordSerializer()

        expected_fields = {
            "recordsid",
            "operationid",
            "batchid",
            "timestamp",
            "hashvalue",
            "previoushash",
            "batch_name",
            "operation_date",
            "entered_by_name",
        }

        self.assertEqual(set(serializer.Meta.fields), expected_fields)