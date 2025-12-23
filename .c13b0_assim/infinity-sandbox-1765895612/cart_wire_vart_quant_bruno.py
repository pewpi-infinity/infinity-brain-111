#!/usr/bin/env python3

from cart_VART_router import execute as vart_execute
from cart_quantize_div import run as quantize_run
from cart_bruno_responder import bruno_execute
from datetime import datetime
import uuid

WIRE_ID = str(uuid.uuid4())

def wire(command, text):
    vart_output = vart_execute(command, text)

    quant_state = quantize_run(vart_output)

    bruno_reaction = bruno_execute({
        "text": text,
        "quant": quant_state
    })

    return {
        "wire_id": WIRE_ID,
        "time": datetime.utcnow().isoformat(),
        "vart": vart_output,
        "quant": quant_state,
        "bruno": bruno_reaction
    }

if __name__ == "__main__":
    cmd = "/youtube /push"
    txt = "Growth trend shows system flow over time."

    result = wire(cmd, txt)
    print(result)
