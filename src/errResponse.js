const errResponse = (statusCode, statusMessage, contentType = "text/plain", data = "") => {
  let errRes = "";
  errRes += `HTTP/1.1 ${statusCode} ${statusMessage} \r\n`;
  errRes += `Content-Type: ${contentType}\r\n\r\n`;
  errRes += data.toString();
  return errRes;
};

class ErrorHandler {
  invalidRequestError(err) {
    const message = err ? err : "Invalid request format";
    return errResponse(400, "Bad Request", "text/plain", message);
  }

  internalServerError(err,statusMessage = "Internal server error") {
    const message = err ? `${statusMessage}: ${err.message}` : statusMessage;
    return errResponse(500, "Internal Server Error", "text/plain", message);  }

  RouteNotFoundError(path) {
    // console.error(`looks like you forgot to add this route - "${path}" bro`);
    return errResponse(404, "Not Found", "text/plain", 
      `can't get ${path}\n`);
  }

  methodNotAllowedError() {
    return errResponse(405, "Method Not Allowed", "text/plain", "Method not allowed");
  }

  requestSize_to_large(){
    return errResponse(400,'Bad Request','application/json','Request size too large')
  }
}

module.exports =  new ErrorHandler();
