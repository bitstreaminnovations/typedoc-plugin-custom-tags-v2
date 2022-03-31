/*
 * plugin.ts
 *
 * TypeDoc plugin implementation.
 *
 * Created:  2022/03/28
 * Author:   Chris Wilson
 *
 * Copyright © 2022 Bitstream Innovations, LLC.
 */

import { Application, Context, Converter, DeclarationReflection, PageEvent, ParameterType } from 'typedoc';

// Extend TypeDoc's options with this plugin's options...
declare module 'typedoc' {
  // noinspection JSUnusedGlobalSymbols
  export interface TypeDocOptionMap {
    customTagsConfig:TagConfigMap
  }
}

/**
 * Maps tag names to their Markdown-formatted tag value replacement strings.
 * The tag's value will be compared with the optional `regex` property (also
 * utilizing any supplied `regexFlags`). If regex/regexFlags are not provided,
 * they default to `regex = "^\\s*(.*?)\\s*$"` and `regexFlags = "s"`. In this
 * way, the entire original tag value text (trimmed of whitespace) can be
 * inserted into the replacement string with the capture group `$1`. If a regex
 * is provided, its capture groups can be utilized in the Markdown-formatted
 * `replacement` string (but note any/all desired text from the input tag value
 * must be captured in a group for access in `replacement`).
 *
 * @example
 * {
 *   tagName: 'helloTag',
 *   regex: '^<p>(.*)</p>$'
 *   replacement: '```html\n<div>$1</div>\n```'
 * }
 * Example input tag value: <p>Hello World!</p>
 * Resulting formatted text: '```html\n<div>Hello World!</div>\n```'
 */
interface TagConfigEntry {
  tagName: string,
  regex?: string | RegExp,
  regexFlags?: string,
  replacement: string
}

type TagConfigMap = TagConfigEntry[];

/**
 * TypeDoc Plugin class definition to replace comment tags with configured
 * Markdown-formatted strings.
 */
export class TypeDocPlugin {
  private app:Readonly<Application> | undefined;
  private options:TagConfigMap | undefined;

  /**
   * Initialize the plugin
   * @param app Reference to the TypeDoc application
   */
  initialize (app:Readonly<Application>):void {
    this.app = app;
    // Declare plugin options property...
    app.options.addDeclaration({
      type: ParameterType.Mixed,
      name: 'customTagsConfig',
      help: 'An array of configurations to match custom tags, their values, and provide Markdown-formatted tag value replacement strings.',
      defaultValue: { }
    });

    // Add TypeDoc event registrations...
    app.converter.on(Converter.EVENT_BEGIN, this.onConverterBegin.bind(this))
    app.renderer.on(PageEvent.BEGIN, this.onRendererPageBegin.bind(this));
  }

  /**
   * Event handler for the TypeDoc Converter's EVENT_BEGIN event.
   * @param context TypeDoc context
   */
  onConverterBegin (context:Readonly<Context>):void {
    if (!this.app) {
      return;
    }

    // Get the plugin's options...
    if (!this.options) {
      this.options = this.app.options.getValue<'customTagsConfig'>('customTagsConfig') as unknown as TagConfigMap;
      this.options .forEach((entry) => {
        if (entry.regex) {
          // Convert the configuration's specified regex string into a
          // RegExp instance...
          entry.regex = new RegExp(entry.regex, entry.regexFlags);
        }
        else {
          // No regex specified, so use the following, which will match the
          // entire tag value, stripped of leading/trailing whitespace...
          entry.regex = new RegExp('^\\s*(.*?)\\s*$', 's');
        }
      });
    }
  }

  /**
   * Event handler for the TypeDoc Renderer's Page BEGIN event.
   * @param page TypeDoc PageEvent instance
   */
  public onRendererPageBegin (page:PageEvent):void {
    if (!this.app) {
      return;
    }

    if (page.model instanceof DeclarationReflection) {
      this.processReflection(page.model);
    }
  }

  private processReflection (reflection: DeclarationReflection):void {
    // If the declaration has comments with tags that are also in our plugin's
    // configuration, do the string replacement according to the configuration...
    (reflection.comment?.tags ?? []).forEach((tag) =>{
      const config = this.options?.find((opt) => {
        if (opt.tagName !== tag.tagName) {
          // Wrong tag...
          return false;
        }
        if (opt.regex instanceof RegExp && opt.regex.test(tag.text)) {
          // Right tag, with regex, which also matches...
          return true;
        }
        // Regex didn't match...
        return false;
      });
      if (config) {
        tag.text = tag.text.replace(config.regex as RegExp, config.replacement);
      }
    });

    (reflection.children ?? []).forEach((child) => this.processReflection(child));
  }
}
