from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date

from batches.models import Batch, Breed, DailyOperations
from reports.models import Report, Records

User = get_user_model()


class ReportRecordsTest(TestCase):

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
            batchname="Test Batch",
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
            mortalitycount=2
        )

    def test_report_creation(self):
        report = Report.objects.create(
            batchid=self.batch,
            type="Egg Report",
            generatedby=self.user,
            filepath="/reports/test.pdf"
        )

        self.assertTrue(report.reportid.startswith("REP"))
        self.assertEqual(report.type, "Egg Report")
        self.assertEqual(report.generatedby, self.user)
        self.assertIsNotNone(report.generateddate)

    def test_report_auto_increment(self):
        report1 = Report.objects.create(type="R1")
        report2 = Report.objects.create(type="R2")

        self.assertNotEqual(report1.reportid, report2.reportid)
        self.assertTrue(report1.reportid.startswith("REP"))
        self.assertTrue(report2.reportid.startswith("REP"))

    def test_records_creation(self):
        record = Records.objects.create(
            operationid=self.operation,
            batchid=self.batch,
            hashvalue="abc123",
            previoushash="xyz789"
        )

        self.assertTrue(record.recordsid.startswith("REC"))
        self.assertEqual(record.operationid, self.operation)
        self.assertEqual(record.batchid, self.batch)

    def test_record_auto_id(self):
        record1 = Records.objects.create(
            operationid=self.operation,
            batchid=self.batch,
            hashvalue="hash1"
        )

        record2 = Records.objects.create(
            operationid=self.operation,
            batchid=self.batch,
            hashvalue="hash2"
        )

        self.assertNotEqual(record1.recordsid, record2.recordsid)
        self.assertTrue(record1.recordsid.startswith("REC"))
        self.assertTrue(record2.recordsid.startswith("REC"))

    def test_str_methods(self):
        report = Report.objects.create(type="Test Report")
        record = Records.objects.create(
            operationid=self.operation,
            batchid=self.batch,
            hashvalue="hash"
        )

        self.assertIn("REP", str(report))
        self.assertIn("REC", str(record))