# @acot/acot-preset-wcag

> A WCAG-based rule set for acot.

## Install

Install via npm:

```bash
$ npm install --save-dev @acot/acot-preset-wcag
```

## Usage

Add `@acot/wcag` to the `presets` field of the acot config file. then configure the rules you want to use under the rules section.

```json
{
  "presets": ["@acot/wcag"],
  "rules": {
    "@acot/wcag/button-has-name": "error"
  }
}
```

You can also enable all the recommended rules for our preset. Add `preset:@acot/wcag/recommended` in `extends`:

```json
{
  "extends": ["preset:@acot/wcag/recommended"]
}
```

## Supported Rules

<!-- acot-rules:start -->

| Name                                                                                    | Summary                                                                    | :heavy_check_mark: |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------------- |
| [`@acot/wcag/dialog-focus`](./docs/rules/dialog-focus.md)                               | Move focus to inside dialog or set dialog after trigger.                   | :heavy_check_mark: |
| [`@acot/wcag/focusable-has-indicator`](./docs/rules/focusable-has-indicator.md)         | Focusable elemenet has a focus indicator.                                  | :heavy_check_mark: |
| [`@acot/wcag/img-has-name`](./docs/rules/img-has-name.md)                               | The `img` element or img role MUST has name.                               | :heavy_check_mark: |
| [`@acot/wcag/interactive-has-enough-size`](./docs/rules/interactive-has-enough-size.md) | The size of the target for pointer inputs is at least 44 by 44 CSS pixels. | :heavy_check_mark: |
| [`@acot/wcag/interactive-has-name`](./docs/rules/interactive-has-name.md)               | Interactive elements MUST has name.                                        | :heavy_check_mark: |
| [`@acot/wcag/interactive-supports-focus`](./docs/rules/interactive-supports-focus.md)   | _T.B.A_                                                                    | :heavy_check_mark: |
| [`@acot/wcag/page-has-title`](./docs/rules/page-has-title.md)                           | Web pages have titles that describe topic or purpose. WCAG 2.1 - 2.4.2.    | :heavy_check_mark: |
| [`@acot/wcag/page-has-valid-lang`](./docs/rules/page-has-valid-lang.md)                 | The `html` element MUST has a valid lang attribute.                        | :heavy_check_mark: |

<!-- acot-rules:end -->

## Coverage WCAG 2.1 by @acot/acot-preset-wcag

### Perceivable

#### 1.1 Text Alternatives

| Success criteria       | acot rules                                              |
| ---------------------- | ------------------------------------------------------- |
| 1.1.1 Non-text Content | [@acot/wcag/img-has-name](./docs/rules/img-has-name.md) |

#### 1.2 Time-based Media

| Success criteria                                           | acot rules |
| ---------------------------------------------------------- | ---------- |
| 1.2.1 Audio-only and Video-only (Prerecorded)              | -          |
| 1.2.2 Captions (Prerecorded)                               | -          |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | -          |
| 1.2.4 Captions (Live)                                      | -          |
| 1.2.5 Audio Description (Prerecorded)                      | -          |
| 1.2.6 Sign Language (Prerecorded)                          | -          |
| 1.2.7 Extended Audio Description (Prerecorded)             | -          |
| 1.2.8 Media Alternative (Prerecorded)                      | -          |
| 1.2.9 Audio-only (Live)                                    | -          |

#### 1.3 Adaptable

| Success criteria              | acot rules |
| ----------------------------- | ---------- |
| 1.3.1 Info and Relationships  | -          |
| 1.3.2 Meaningful Sequence     | -          |
| 1.3.3 Sensory Characteristics | -          |
| 1.3.4 Orientation             | -          |
| 1.3.5 Identify Input Purpose  | -          |
| 1.3.6 Identify Purpose        | -          |

#### 1.4 Distinguishable

| Success criteria                    | acot rules |
| ----------------------------------- | ---------- |
| 1.4.1 Use of Color                  | -          |
| 1.4.2 Audio Control                 | -          |
| 1.4.3 Contrast (Minimum)            | -          |
| 1.4.4 Resize text                   | -          |
| 1.4.5 Images of Text                | -          |
| 1.4.6 Contrast (Enhanced)           | -          |
| 1.4.7 Low or No Background Audio    | -          |
| 1.4.8 Visual Presentation           | -          |
| 1.4.9 Images of Text (No Exception) | -          |
| 1.4.10 Reflow                       | -          |
| 1.4.11 Non-text Contrast            | -          |
| 1.4.12 Text Spacing                 | -          |
| 1.4.13 Content on Hover or Focus    | -          |

### 2. Operable

#### 2.1 Keyboard Accessible

| Success criteria              | acot rules                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| 2.1.1 Keyboard                | [@acot/wcag/interactive-supports-focus](./docs/rules/interactive-supports-focus.md) |
| 2.1.2 No Keyboard Trap        | -                                                                                   |
| 2.1.3 Keyboard (No Exception) | -                                                                                   |
| 2.1.4 Character Key Shortcuts | -                                                                                   |

#### 2.2 Enough Time

| Success criteria        | acot rules |
| ----------------------- | ---------- |
| 2.2.1 Timing Adjustable | -          |
| 2.2.2 Pause, Stop, Hide | -          |
| 2.2.3 No Timing         | -          |
| 2.2.4 Interruptions     | -          |
| 2.2.5 Re-authenticating | -          |
| 2.2.6 Timeouts          | -          |

#### 2.3 Seizures and Physical Reactions

| Success criteria                       | acot rules |
| -------------------------------------- | ---------- |
| 2.3.1 Three Flashes or Below Threshold | -          |
| 2.3.2 Three Flashes                    | -          |
| 2.3.3 Animation from Interactions      | -          |

#### 2.4 Navigable

| Success criteria                | acot rules                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------- |
| 2.4.1 Bypass Blocks             | -                                                                             |
| 2.4.2 Page Titled               | [@acot/wcag/page-has-title](./docs/rules/page-has-title.md)                   |
| 2.4.3 Focus Order               | [@acot/wcag/dialog-focus](./docs/rules/dialog-focus.md)                       |
| 2.4.4 Link Purpose (In Context) | -                                                                             |
| 2.4.5 Multiple Ways             | -                                                                             |
| 2.4.6 Headings and Labels       | -                                                                             |
| 2.4.7 Focus Visible             | [@acot/wcag/focusable-has-indicator](./docs/rules/focusable-has-indicator.md) |
| 2.4.8 Location                  | -                                                                             |
| 2.4.9 Link Purpose (Link Only)  | -                                                                             |
| 2.4.10 Section Headings         | -                                                                             |

#### 2.5 Input Modalities

| Success criteria                  | acot rules                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| 2.5.1 Pointer Gestures            | -                                                                                     |
| 2.5.2 Pointer Cancellation        | -                                                                                     |
| 2.5.3 Label in Name               | -                                                                                     |
| 2.5.4 Motion Actuation            | -                                                                                     |
| 2.5.5 Target Size                 | [@acot/wcag/interactive-has-enough-size](./docs/rules/interactive-has-enough-size.md) |
| 2.5.6 Concurrent Input Mechanisms | -                                                                                     |

### 3. Understandable

#### 3.1 Readable

| Success criteria        | acot rules                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| 3.1.1 Language of Page  | [@acot/wcag/page-has-valid-lang](./docs/rules/page-has-valid-lang.md) |
| 3.1.2 Language of Parts | -                                                                     |
| 3.1.3 Unusual Words     | -                                                                     |
| 3.1.4 Abbreviations     | -                                                                     |
| 3.1.5 Reading Level     | -                                                                     |
| 3.1.6 Pronunciation     | -                                                                     |

#### 3.2 Predictable

| Success criteria                | acot rules |
| ------------------------------- | ---------- |
| 3.2.1 On Focus                  | -          |
| 3.2.2 On Input                  | -          |
| 3.2.3 Consistent Navigation     | -          |
| 3.2.4 Consistent Identification | -          |
| 3.2.5 Change on Request         | -          |

#### 3.3 Input Assistance

| Success criteria                                | acot rules |
| ----------------------------------------------- | ---------- |
| 3.3.1 Error Identification                      | -          |
| 3.3.2 Labels or Instructions                    | -          |
| 3.3.3 Error Suggestion                          | -          |
| 3.3.4 Error Prevention (Legal, Financial, Data) | -          |
| 3.3.5 Help                                      | -          |
| 3.3.6 Error Prevention (All)                    | -          |

### 4. Robust

#### 4.1 Compatible

| Success criteria        | acot rules |
| ----------------------- | ---------- |
| 4.1.1 Parsing           | -          |
| 4.1.2 Name, Role, Value | -          |
| 4.1.3 Status Messages   | -          |

## Concept

### Interactive content

Some rules deal with interactive content. The definition of interactive content to be audited is as follows:

1. [3.2.5.2.7 Interactive content](https://html.spec.whatwg.org/multipage/dom.html#interactive-content) compliant elements.
1. Elements with a role attribute that conforms to the above.
1. Focusable elements.

---

_T.B.A_
