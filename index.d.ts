/**
 * Options to configure the behavior of the TextEncoder.
 *
 * @remarks
 * - Based on the WHATWG Encoding Standard, the only officially recognized encoding
 *   for the constructor is "utf-8".
 * - However, setting `NONSTANDARD_allowLegacyEncoding` to `true` enables
 *   non-standard behavior, allowing other encodings.
 */
export interface TextEncoderOptions {
    /**
     * If `true`, allows non-standard legacy encodings (not just UTF-8).
     * This is not part of the official WHATWG standard.
     */
    NONSTANDARD_allowLegacyEncoding?: boolean;

    /**
     * If `true`, the encoder will operate in “fatal” mode.
     * In “fatal” mode the TextEncoder will throw if it encounters an error
     * during encoding. Defaults to `false`.
     */
    fatal?: boolean;
}

/**
 * Options for encoding text using the TextEncoder.
 */
export interface TextEncodeOptions {
    /**
     * If `true`, indicates that the encoded bytes should be flushed in a streaming fashion,
     * allowing multiple calls to encode() in sequence without resetting the internal state.
     *
     * @remarks
     * For UTF-8, this typically has no real effect since the encoder does not keep
     * significant state between chunks, but it remains part of the spec.
     */
    stream?: boolean;
}

/**
 * Converts strings into their corresponding UTF-8 encoded Uint8Array representation.
 *
 * @remarks
 * By default, only UTF-8 encoding is officially supported under the WHATWG standard.
 * Non-standard behavior may be enabled to allow legacy encodings by passing
 * `NONSTANDARD_allowLegacyEncoding` in the constructor options.
 */
export declare class TextEncoder {
    /**
     * The name of the encoding used by this encoder, which is always "utf-8"
     * (unless non-standard legacy encodings are allowed).
     */
    readonly encoding: string;

    /**
     * Creates a new TextEncoder instance.
     *
     * @param label - A label indicating the encoding (usually "utf-8"). Non-standard if changed.
     * @param options - Configuration options, primarily controlling error mode and legacy encodings.
     */
    constructor(label?: string, options?: TextEncoderOptions);

    /**
     * Encodes the input string into a Uint8Array containing UTF-8 (or other legacy) code units.
     *
     * @param input - The text to be encoded.
     * @param options - Whether to perform streaming encoding, though this generally has no effect for UTF-8.
     * @returns The UTF-8 (or chosen legacy) encoded bytes in a Uint8Array.
     */
    encode(input?: string, options?: TextEncodeOptions): Uint8Array;
}

/**
 * Options for configuring a TextDecoder instance.
 */
export interface TextDecoderOptions {
    /**
     * If `true`, the decoder will throw an exception on any decoding error (invalid byte sequences).
     * Defaults to `false`, in which case it replaces invalid sequences with U+FFFD.
     */
    fatal?: boolean;

    /**
     * If `true`, the decoder will ignore the UTF-8/16 BOM if present.
     * Defaults to `false` (the BOM is honored if found).
     */
    ignoreBOM?: boolean;

    /**
     * If `true`, allows non-standard legacy encodings (not just UTF-8, UTF-16).
     * This is not part of the official WHATWG standard.
     */
    NONSTANDARD_allowLegacyEncoding?: boolean;
}

/**
 * Options for decoding text using the TextDecoder.
 */
export interface TextDecodeOptions {
    /**
     * If `true`, it decodes the current buffer stream without flushing the internal state.
     *
     * @remarks
     * This is relevant for certain stateful encodings where incomplete byte sequences
     * can span multiple chunks. For UTF-8, it usually has no significant effect.
     */
    stream?: boolean;
}

/**
 * Decodes text from an ArrayBuffer or ArrayBuffer-like object (TypedArray, DataView)
 * into a JavaScript string, according to the WHATWG Encoding Standard.
 *
 * @remarks
 * By default, only UTF-8 is officially supported. Non-standard
 * options may allow other legacy encodings.
 */
declare class TextDecoder {
    /**
     * The name of the encoding used by this decoder (e.g., "utf-8", "utf-16le"), in lowercase.
     */
    readonly encoding: string;

    /**
     * Indicates if this decoder is operating in fatal mode (throwing on invalid sequences).
     */
    readonly fatal: boolean;

    /**
     * Indicates if this decoder will ignore the BOM if present.
     */
    readonly ignoreBOM: boolean;

    /**
     * Creates a new TextDecoder instance.
     *
     * @param label - The label (name) of the encoding. Typically "utf-8".
     * Non-standard usage may allow other encodings.
     * @param options - Controls error mode, BOM handling, and non-standard usage.
     */
    constructor(label?: string, options?: TextDecoderOptions);

    /**
     * Decodes the given input into a string.
     *
     * @param input - A buffer (ArrayBuffer or a view on it) containing the encoded bytes, or `null`.
     * @param options - If `stream` is `true`, decoding will not flush the internal buffers,
     * letting subsequent chunks complete any pending sequences.
     * @returns The decoded string.
     *
     * @throws {TypeError} If `fatal` is `true` and the byte sequence cannot be decoded.
     */
    decode(
        input?: ArrayBuffer | ArrayBufferView | null,
        options?: TextDecodeOptions,
    ): string;
}
