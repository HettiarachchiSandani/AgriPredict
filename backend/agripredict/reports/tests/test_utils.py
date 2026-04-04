import os
from django.test import TestCase
from reports.utils import generate_pdf, generate_excel  # adjust path if needed


class ExportUtilsTestCase(TestCase):

    def setUp(self):
        self.test_data = [
            {
                "name": "Batch 1",
                "count": 100,
                "status": "Active"
            },
            {
                "name": "Batch 2",
                "count": 200,
                "status": "Completed"
            }
        ]

        self.pdf_path = "test_report.pdf"
        self.excel_path = "test_report.xlsx"

    def test_generate_pdf(self):
        generate_pdf(self.pdf_path, self.test_data)

        self.assertTrue(os.path.exists(self.pdf_path))
        self.assertGreater(os.path.getsize(self.pdf_path), 0)

        # Cleanup
        os.remove(self.pdf_path)

    def test_generate_excel(self):
        generate_excel(self.excel_path, self.test_data)

        self.assertTrue(os.path.exists(self.excel_path))
        self.assertGreater(os.path.getsize(self.excel_path), 0)

        # Cleanup
        os.remove(self.excel_path)