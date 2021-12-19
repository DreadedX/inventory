from twirp.asgi import TwirpASGIApp
from twirp.exceptions import TwirpServerException
from twirp.errors import Errors
from brother_ql.conversion import convert
from brother_ql.backends.helpers import send
from brother_ql.raster import BrotherQLRaster
from PIL import Image
from io import BytesIO

from handlers.printer import printer_twirp, printer_pb2

backend = "linux_kernel"
model = "QL-700"
printer = "file:///dev/usb/lp0"

qlr = BrotherQLRaster(model)
qlr.exception_on_warning = True

class PrinterService(object):
    def Print(self, context, request):
        image = Image.open(BytesIO(request.image))
        instructions = convert(qlr=qlr, images=[image], cut=True, label="62")
        try:
            send(instructions=instructions, printer_identifier=printer, backend_identifier=backend, blocking=True)
        except:
            raise TwirpServerException(code=Errors.Unavailable, message="Printer is unavailable")

        return printer_pb2.PrintResponse()

service = printer_twirp.PrinterServer(service=PrinterService())
app = TwirpASGIApp()
app.add_service(service)
