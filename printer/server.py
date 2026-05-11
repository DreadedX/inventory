from io import BytesIO

from brother_ql.backends.helpers import send
from brother_ql.conversion import convert
from brother_ql.raster import BrotherQLRaster
from handlers.printer import printer_pb2, printer_twirp
from PIL import Image
from twirp.asgi import TwirpASGIApp
from twirp.errors import Errors
from twirp.exceptions import TwirpServerException

backend = "linux_kernel"
model = "QL-700"
printer = "file:///dev/usb/lp0"


class PrinterService(object):
    def Print(self, context, request):
        qlr = BrotherQLRaster(model)
        qlr.exception_on_warning = True

        image = Image.open(BytesIO(request.image))
        instructions = convert(qlr=qlr, images=[image], cut=True, label="62")
        try:
            send(
                instructions=instructions,
                printer_identifier=printer,
                backend_identifier=backend,
                blocking=True,
            )
        except Exception as e:
            print(f"Error: {e}")
            raise TwirpServerException(
                code=Errors.Unavailable, message="Printer is unavailable"
            )

        return printer_pb2.PrintResponse()


service = printer_twirp.PrinterServer(service=PrinterService())
app = TwirpASGIApp()
app.add_service(service)
