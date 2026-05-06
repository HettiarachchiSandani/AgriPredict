import hashlib
import json
from datetime import datetime
from .models import Records
from batches.models import DailyOperations

def generate_operation_hash(operation: DailyOperations, previous_hash: str) -> str:
    record_data = {
        'operationid': operation.operationid,
        'batchid': operation.batch.batchid,
        'feedusage': operation.feedusage,
        'eggcount': operation.eggcount,
        'mortalitycount': operation.mortalitycount,
        'avgeggweight': operation.avgeggweight,
        'male_mortality': operation.male_mortality,
        'female_mortality': operation.female_mortality,
        'water_used': operation.water_used,
        'entered_by': operation.entered_by.email if operation.entered_by else None,
        'previous_hash': previous_hash
    }

    record_string = json.dumps(record_data, sort_keys=True)
    return hashlib.sha256(record_string.encode()).hexdigest()


def add_block(operation: DailyOperations):
    last_block = Records.objects.order_by('-timestamp').first()
    previous_hash = last_block.hashvalue if last_block else "0"

    record_hash = generate_operation_hash(operation, previous_hash)

    Records.objects.create(
        recordsid=f"R{operation.operationid}",
        operationid=operation,
        batchid=operation.batch,
        hashvalue=record_hash,
        previoushash=previous_hash,
        timestamp=datetime.now(),
    )


def verify_blockchain():
    blocks = list(Records.objects.order_by('timestamp'))

    for i in range(1, len(blocks)):
        current_block = blocks[i]
        previous_block = blocks[i - 1]

        recalculated_hash = generate_operation_hash(
            current_block.operationid,
            current_block.previoushash
        )

        if current_block.hashvalue != recalculated_hash:
            return False, current_block.recordsid

        if current_block.previoushash != previous_block.hashvalue:
            return False, current_block.recordsid

    return True, None

def verify_latest_block():
    last_block = Records.objects.order_by('-timestamp').first()
    if not last_block:
        return True, None

    recalculated_hash = generate_operation_hash(
        last_block.operationid,
        last_block.previoushash
    )

    if last_block.hashvalue != recalculated_hash:
        return False, last_block.recordsid

    return True, None