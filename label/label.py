#! /usr/bin/env python3
from blabel import LabelWriter
from pdf2image import convert_from_bytes
from io import BytesIO
import base64
import json
import sys

if len(sys.argv) != 3:
    print("Not correct amount of arguments")
    exit(-1)

template = sys.argv[1]

item_writer = LabelWriter(f"../label/{template}/template.html", default_stylesheets=(f"../label/{template}/style.css",))

item = json.loads(sys.argv[2])

data = item_writer.write_labels([item], target='@memory')

pages = convert_from_bytes(data, 300)
buffered = BytesIO()
pages[0].save(buffered, "png")

print(base64.b64encode(buffered.getvalue()).decode("ascii"))
