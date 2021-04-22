export class RelatedNodesUtils {

    /**
     * Returns a random range that is also randomly positive or negative
     *
     * @param min Minimum number generated
     * @param max Maximum number generated
     * @Return Returns a number that is randomly positive or negative within the given range
     */
    public randomRange(min: number, max: number) : number {
        let rand = Math.random() * (max - min) + min;

        if (Math.random() < 0.5) {
            rand = rand * -1;
        }

        return rand;
    }


}