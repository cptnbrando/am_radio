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

    // Framerate of sketch
    rate: number;

    /**
     * Paint our sketch, takes a position to be more accurate
     * @param ctx context to draw with
     * @param position the current position
     */
    paint(ctx: CanvasRenderingContext2D, position: number): void 
}
