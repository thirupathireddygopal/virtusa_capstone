// Define the custom error class
export class ErrorHandler extends Error {
    // property to hold the HTTP status code
    status: number;

    //constructor is a special method that is called when a new instance of the ErrorHandler class is created
    constructor(message: string, status: number) {
        // super(message) calls the constructor of the parent Error class, passing the message parameter to it.
        // this sets the message property of the Error instance to the provided message.
        super(message);

        // set the status property to the provided status code
        this.status = status;

        // Error.captureStackTrace(this, this.constructor) is a V8-specific feature that creates a .stack property on the ErrorHandler instance.
        // This property contains a stack trace that shows where the error was instantiated.
        // The first argument this is the current instance of the ErrorHandler.
        // The second argument this.constructor specifies the function to exclude from the stack trace, which helps to create a cleaner stack trace by omitting the constructor call itself.
        Error.captureStackTrace(this, this.constructor);
    }

}