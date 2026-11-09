/**
 * Heading order for CMS rich text.
 *
 * Studio offers Heading, Subheading and Small heading (h2, h3, h4), and editors
 * pick them for size, not structure. A body that opens with a Small heading
 * straight under the page's h1 skips two levels, which breaks the outline
 * screen-reader users navigate by (WCAG 1.3.1). Rather than restrict editors,
 * each heading is raised just enough to close any gap, and keeps the size the
 * editor chose through a `look-hN` class.
 */
import { h, type FunctionalComponent } from 'vue';
import type { PortableTextComponents } from '@portabletext/vue';

const HEADING = /^h([2-6])$/;

type Block = { _type: string; style?: string; _look?: number } & Record<string, unknown>;

export function withHeadingOrder<T extends Block>(blocks: T[] | null | undefined, top = 2): T[] {
  if (!blocks?.length) return [];
  let prev = top - 1;
  return blocks.map((block) => {
    const m = block._type === 'block' && block.style ? HEADING.exec(block.style) : null;
    if (!m) return block;
    const chosen = Number(m[1]);
    const level = Math.max(top, Math.min(chosen, prev + 1));
    prev = level;
    return level === chosen ? block : { ...block, style: `h${level}`, _look: chosen };
  });
}

function heading(level: number): FunctionalComponent<{ value: Block }> {
  return (props, { slots }) =>
    h(`h${level}`, props.value._look ? { class: `look-h${props.value._look}` } : null, slots.default?.());
}

export const richTextComponents: PortableTextComponents = {
  block: { h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6) },
};
