const handleRequest = require("./requestHandler.js");
const ErrorHandler = require("./errResponse.js");
const { Buffer } = require("buffer");
const Cache = require("./cache.js");
const {parseRequestBody,parseRequestHeader} = require("./requestParser.js");

const cache = new Cache();

module.exports = async function handleConnection(socket, maya) {
  let buffer = Buffer.alloc(0);
  let parsedHeader;

  socket.on("data", async (chunk) => {
    // const startTime = Date.now();
    buffer = Buffer.concat([buffer, chunk]);
    await processBuffer()
  });

  socket.on('close', () => {
    socket.end()
  });

  socket.on("error", (e) => {
    // console.log("error on socket: ", e);
    // socket.end()
  });


  async function processBuffer(){
    if (!parsedHeader) {
      const headerEndIndex = buffer.indexOf("\r\n\r\n");
      if (headerEndIndex !== -1) {
  
        const headerPart = buffer.slice(0, headerEndIndex + 4);
     
        parsedHeader = parseRequestHeader(headerPart,cache);

        if (parsedHeader?.error) {
          return parsedRequestError(socket, parsedHeader.error);
        }

        const contentLength = parseInt(parsedHeader?.headers["content-length"] || 0,10);
        buffer = buffer.slice(headerEndIndex + 4);

        if (parsedHeader.method === "GET" || (contentLength <=0)) {
          // call the reqHandler because we dont need to parse body
          await handleRequest(socket, parsedHeader, maya);
          parsedHeader=null;
          return;
        }
      }
    }
  
    const contentLength = parseInt(parsedHeader?.headers["content-length"] || 0, 10);
    if (buffer.length >= contentLength) {
      const bodyBuffer = buffer.slice(0, contentLength);  // Extract the body based on content-length
        const parsedBody = await parseRequestBody(bodyBuffer, parsedHeader?.headers);

        if (parsedBody?.error) {
          return parsedRequestError(socket, parsedBody.error);
        }

        const finalResult = {...parsedHeader, ...parsedBody};
        await handleRequest(socket, finalResult, maya);

        buffer = buffer.slice(contentLength)
        parsedHeader=null;
        
      }
    }
  }

function parsedRequestError(socket, error) {
  // console.error("Request parsing error:", error);
  socket.write(ErrorHandler.invalidRequestError(error));
  socket.end();
}
