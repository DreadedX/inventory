#! /usr/bin/env python3
from blabel import LabelWriter
from pdf2image import convert_from_bytes
from io import BytesIO
import argparse
import base64
import json
import os

parser = argparse.ArgumentParser(description="Generate and print inventory labels")
parser.add_argument("type", help="Type of label to generate")
parser.add_argument("data", help="Data for the label")
parser.add_argument("--preview", action="count", default=0, help="Create a preview image")
parser.add_argument("--debug", action="count", default=0, help="Preview labels during development")

args = parser.parse_args()

template = args.type

dirname = os.path.dirname(__file__)
writer = LabelWriter(f"{dirname}/{template}/template.html", default_stylesheets=(f"{dirname}/{template}/style.css",))

data = json.loads(args.data)

data = writer.write_labels([data], target='@memory')

pages = convert_from_bytes(data, 300)
buffered = BytesIO()
pages[0].save(buffered, "png")

if (args.debug):
    pages[0].show()
    pass
elif (args.preview):
    print(base64.b64encode(buffered.getvalue()).decode("ascii"))
else:
    backend = "linux_kernel"
    model = "QL-700"
    printer = "file:///dev/usb/lp0"
    from brother_ql.conversion import convert
    from brother_ql.backends.helpers import send
    from brother_ql.raster import BrotherQLRaster
    qlr = BrotherQLRaster(model)
    qlr.exception_on_warning = True
    instructions = convert(qlr=qlr, images=pages, cut=True, label="62")
    send(instructions=instructions, printer_identifier=printer, backend_identifier=backend, blocking=True)

    print("TEST")
