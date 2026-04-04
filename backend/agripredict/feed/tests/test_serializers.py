from django.test import TestCase
from feed.models import FeedStock
from feed.serializers import FeedStockSerializer


class FeedStockSerializerTest(TestCase):

    def test_stockid_auto_generated(self):
        data = {
            "feedtype": "Feed A",
            "quantity": 100
        }

        serializer = FeedStockSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        stock = serializer.save()

        self.assertIsNotNone(stock.stockid)
        self.assertTrue(stock.stockid.startswith("FS"))

    def test_stockid_increment(self):
        serializer1 = FeedStockSerializer(data={
            "feedtype": "Feed A",
            "quantity": 100
        })
        self.assertTrue(serializer1.is_valid())
        stock1 = serializer1.save()

        serializer2 = FeedStockSerializer(data={
            "feedtype": "Feed B",
            "quantity": 200
        })
        self.assertTrue(serializer2.is_valid())
        stock2 = serializer2.save()

        # Check increment
        num1 = int(stock1.stockid.replace("FS", ""))
        num2 = int(stock2.stockid.replace("FS", ""))

        self.assertEqual(num2, num1 + 1)

    def test_manual_stockid_allowed(self):
        data = {
            "feedtype": "Feed C",
            "quantity": 50
        }

        serializer = FeedStockSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        stock = serializer.save()

        self.assertTrue(stock.stockid.startswith("FS"))

    def test_stockid_format(self):
        serializer = FeedStockSerializer(data={
            "feedtype": "Feed D",
            "quantity": 10
        })
        self.assertTrue(serializer.is_valid())
        stock = serializer.save()

        self.assertRegex(stock.stockid, r"^FS\d{3}$")