import { Time } from './time.model';

/**
 * A sketch, or a single frame of a visual representation of given audio data
 * Must have a paint method, which uses the given Canvas Context and position to paint a frame
 */
export interface Sketch extends Time {
    // Name of sketch
    name: string;

    // Name of sketch creator
    creator: string;

    // Sketch time offset, all positions will be increased by this number
    offset: number;

    /**
     * Paint our sketch, takes a position to be more accurate
     * @param ctx context to draw with
     * @param position the current position
     */
    paint(ctx: CanvasRenderingContext2D, position: number): void;

    /**
     * This will be called in the render loop
     * It should call paint and clear the canvas when it needs to
     * @param ctx context to loop draw on
     * @param position the current position
     */
    loop(ctx: CanvasRenderingContext2D, position: number): Promise<any>;

    reset(): void;
}
