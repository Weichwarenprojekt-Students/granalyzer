export class EntityNotValidException extends Error {
    constructor(message?: string) {
        super(message);

        Object.setPrototypeOf(this, EntityNotValidException.prototype);
    }
}
