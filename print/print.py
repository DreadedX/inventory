from brother_ql.conversion import convert
from brother_ql.backends.helpers import send
from brother_ql.raster import BrotherQLRaster
from PIL import Image
from io import BytesIO
import sys

data = sys.stdin.buffer.read()
image = Image.open(BytesIO(data))

backend = "linux_kernel"
model = "QL-700"
printer = "file:///dev/usb/lp0"
qlr = BrotherQLRaster(model)
qlr.exception_on_warning = True
instructions = convert(qlr=qlr, images=[image], cut=True, label="62")
send(instructions=instructions, printer_identifier=printer, backend_identifier=backend, blocking=True)
