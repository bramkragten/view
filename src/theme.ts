import {Facet} from "@codemirror/state"
import {StyleModule, StyleSpec} from "style-mod"

export const theme = Facet.define<string, string>({combine: strs => strs.join(" ")})

export const darkTheme = Facet.define<boolean, boolean>({combine: values => values.indexOf(true) > -1})

export const baseThemeID = StyleModule.newName()

function expandThemeClasses(sel: string) {
  return sel.replace(/\$\w[\w\.]*/g, cls => {
    let parts = cls.slice(1).split("."), result = ""
    for (let i = 1; i <= parts.length; i++) result += ".cm-" + parts.slice(0, i).join("-")
    return result
  })
}

export function buildTheme(main: string, spec: {[name: string]: StyleSpec}) {
  return new StyleModule(spec, {
    process(sel) {
      sel = expandThemeClasses(sel)
      return /\$/.test(sel) ? sel.replace(/\$/, main) : main + " " + sel
    },
    extend(template, sel) {
      template = expandThemeClasses(template)
      return sel.slice(0, main.length + 1) == main + " "
        ? main + " " + template.replace(/&/g, sel.slice(main.length + 1))
        : template.replace(/&/g, sel)
    }
  })
}

/// Create a set of CSS class names for the given theme class, which
/// can be added to a DOM element within an editor to make themes able
/// to style it. Theme classes can be single words or words separated
/// by dot characters. In the latter case, the returned classes
/// combine those that match the full name and those that match some
/// prefix—for example `"panel.search"` will match both the theme
/// styles specified as `"panel.search"` and those with just
/// `"panel"`. More specific theme classes (with more dots) take
/// precedence over less specific ones.
export function themeClass(selector: string): string {
  if (selector.indexOf(".") < 0) return "cm-" + selector
  let parts = selector.split("."), result = ""
  for (let i = 1; i <= parts.length; i++)
    result += (result ? " " : "") + "cm-" + parts.slice(0, i).join("-")
  return result
}    

export const baseTheme = buildTheme("." + baseThemeID, {
  $: {
    position: "relative !important",
    boxSizing: "border-box",
    "&$focused": {
      // FIXME it would be great if we could directly use the browser's
      // default focus outline, but it appears we can't, so this tries to
      // approximate that
      outline_fallback: "1px dotted #212121",
      outline: "5px auto -webkit-focus-ring-color"
    },
    display: "flex !important",
    flexDirection: "column"
  },

  $scroller: {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },

  $content: {
    margin: 0,
    flexGrow: 2,
    minHeight: "100%",
    display: "block",
    whiteSpace: "pre",
    boxSizing: "border-box",

    padding: "4px 0",
    outline: "none"
  },

  "$$light $content": { caretColor: "black" },
  "$$dark $content": { caretColor: "white" },

  $line: {
    display: "block",
    padding: "0 2px 0 4px"
  },

  $selectionLayer: {
    zIndex: -1,
    contain: "size style"
  },

  $selectionBackground: {
    position: "absolute",
  },
  "$$light $selectionBackground": {
    background: "#d9d9d9"
  },
  "$$dark $selectionBackground": {
    background: "#222"
  },
  "$$focused$light $selectionBackground": {
    background: "#d7d4f0"
  },
  "$$focused$dark $selectionBackground": {
    background: "#233"
  },

  $cursorLayer: {
    zIndex: 100,
    contain: "size style",
    pointerEvents: "none"
  },
  "$$focused $cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },

  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},
  "@keyframes cm-blink2": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},

  $cursor: {
    position: "absolute",
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none",
    display: "none"
  },
  "$$dark $cursor": {
    borderLeftColor: "#444"
  },

  "$$focused $cursor": {
    display: "block"
  },

  "$$light $activeLine": { backgroundColor: "#f3f9ff" },
  "$$dark $activeLine": { backgroundColor: "#223039" },

  "$$light $specialChar": { color: "red" },
  "$$dark $specialChar": { color: "#f78" },

  "$tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },

  $placeholder: {
    color: "#888",
    display: "inline-block"
  },

  $button: {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "3px"
  },

  "$$light $button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },

  "$$dark $button": {
    backgroundImage: "linear-gradient(#555, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },

  $textfield: {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },

  "$$light $textfield": {
    backgroundColor: "white"
  },

  "$$dark $textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
})
