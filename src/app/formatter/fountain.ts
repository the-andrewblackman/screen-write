import { HighlightStyle, LanguageSupport, StreamLanguage } from "@codemirror/language";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { EditorState, Transaction } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";

const tokenTypes = {
	"scene-heading":
		/^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,

	character: /^\s*[A-Z][A-Z0-9 \t]+$/,
	dialogue: /^\s*(\^?)?(?:\n(?!\n+))([\s\S]+)/,
	parenthetical: /^(\(.+\))$/,

	transition: /^(>[^<\n\r]*|[A-Z ]+ TO:)$/,

	synopsis: /^(?:\=(?!\=+) *)(.*)/,
};

function tokenize(stream, state) {
	stream.skipToEnd();

	for (const type in tokenTypes) {
		if (tokenTypes[type].test(stream.string)) {
			if (type === "character") {
				state.inDialogue = true;
			}

			return type;
		}
	}

	if (state.inDialogue) {
		return "dialogue";
	}

	// Action by default
	return "action";
}

function handleBlank(state, indentLevel) {
	state.inDialogue = false;
}

/// A language provider that provides JSON parsing.
export const fountainLanguage = StreamLanguage.define({
	name: "fountains",
	startState: () => ({
		inDialogue: false,
	}),
	token: tokenize,
	blankLine: handleBlank,
	tokenTable: {
		"scene-heading": t.className,
		synopsis: t.docComment,
		action: t.lineComment,
		character: t.propertyName,
		dialogue: t.string,
		parenthetical: t.comment,
		centered: t.heading2,
		page_break: t.heading2,
		transition: t.keyword,
	},
});

export const fountainHighlight = HighlightStyle.define([
	{ tag: t.lineComment, fontFamily: "Courier" },
	{ tag: t.docComment, color: "#888", fontFamily: "Courier" },
	{
		tag: t.className,
		fontWeight: 600,
		textDecoration: "underline",
		fontFamily: "Courier",
	},
	{
		tag: t.heading2,
		fontWeight: 100,
		display: "block",
		textAlign: "center",
		fontFamily: "Courier",
	},
	{
		tag: t.keyword,
		fontWeight: 600,
		display: "block",
		textAlign: "right",
		fontFamily: "Courier",
		textDecoration: "underline",
	},
	{
		tag: t.comment,
		fontStyle: "italic",
		display: "block",
		fontFamily: "Courier",
		textAlign: "center",
	},
	{
		tag: t.propertyName,
		display: "block",
		fontFamily: "Courier",
		textAlign: "center",
	},
	{
		tag: t.string,
		display: "block",
		textAlign: "left",
		fontFamily: "Courier",
		marginLeft: "16em",
		marginRight: "13em",
	},
]);

export function fountain() {
	return new LanguageSupport(fountainLanguage);
}
