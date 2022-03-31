# typedoc-plugin-custom-tags-v2
This is a [TypeDoc](https://github.com/TypeStrong/typedoc) plugin to handle 
custom tags in JSDoc comments.  This plugin was informed by 
https://github.com/shuebner20/typedoc-plugin-custom-tags, but since that plugin
is not compatible with TypeDoc 0.22.x, this one was just developed from scratch.

## Installation
```bash
npm i typedoc-plugin-custom-tags-v2
```

## Usage
Essentially, add a new section `customTagsConfig` to the TypeDoc configuration, like this:
```json
{
  // Other TypeDoc options (see http://typedoc.org/guides/options/#configuration-options)...
  ...
  
  "customTagsConfig": [
    {
      "tagName": "example",
      "regex": "^\\s*({.*?)\\s*$",
      "regexFlags": "s",
      "replacement": "This is a JSON example:\n```js\n$1\n```"
    },
    {
      "tagName": "example",
      "replacement": "This is a plain text example:\n```text\n$1\n```"
    },
    {
      "tagName": "pattern",
      "replacement": "This is a regular expression pattern:\n```js\n/$1/\n```"
    }
  ]
}
```
Each entry in the `customTagsConfig` array specifies a tag name (`tagName`) to 
look for in the JSDoc comments. When found, the tag's value will be replaced 
according to the Markdown-formatted `replacement` string associated with that 
tag.

To allow for formatting variations based on the tag's value, the `regex` and 
`regexFlags` properties can optionally be set. In this way, the configuration 
will only match if *both* the tag name matches `tagName` and the tag's value 
matches the `regex` test.

So, using the above configuration, the following JSDoc comment:
```js
/**
 * Example JSDoc comment.
 * @example { prop1: "a", prop2: "b" }
 * @example -345
 * @pattern ^abc123$
 */
```
Will result in this generated Markdown:

```markdown
    ### example
    This is a JSON example:
    ```js
    { prop1: "a", prop2: "b" }
    ```

    ### example
    This is a plain text example:
    ```text 
    -345
    ```

    ### pattern
    This is a regular expression pattern:
    ```js
    /^abc123$/
    ```
```

## Contributing
Pull requests are welcomed. For major changes, please open an issue first to 
discuss what you would like to change.

## License
[BSD 3-Clause](https://opensource.org/licenses/BSD-3-Clause)
