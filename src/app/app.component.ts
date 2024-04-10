import { AfterViewInit, ElementRef, Component, ViewChild } from "@angular/core";
import { minimalSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Vim, vim, getCM } from "@replit/codemirror-vim";
import { oneDark } from "@codemirror/theme-one-dark";
import { tags as t } from "@lezer/highlight";

import { HighlightStyle, LanguageSupport, StreamLanguage } from "@codemirror/language";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
	title = "component-overview";

	@ViewChild("myeditor") myEditor: ElementRef<HTMLDivElement>;
	cm: EditorView | null = null;

	ngAfterViewInit(): void {
		const myEditorElement = this.myEditor.nativeElement;
		const extensions = [vim(), minimalSetup, oneDark, EditorView.lineWrapping];

		const state = EditorState.create({
			doc: 'console.log("hello");\n// type if.',
			extensions: extensions,
		});

		this.cm = new EditorView({
			state,
			parent: myEditorElement,
		});

		Vim.map("jj", "<Esc>", "insert"); // in insert mode
	}

	saveToFile(): void {
		const myEditorContent = this.myEditor.nativeElement.innerText;

		if (myEditorContent) {
			const blob = new Blob([myEditorContent], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "screeenplay.fountain"; // Change the file extension if needed
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} else {
			console.error("Editor content is empty.");
		}
	}
	fountainHighlight = HighlightStyle.define([
		{ tag: t.lineComment, color: "#444" },
		{ tag: t.docComment, color: "#888" },
		{ tag: t.className, fontWeight: 600 },
		{ tag: t.heading2, fontWeight: 600, display: "block", textAlign: "center" },
		{ tag: t.keyword, fontWeight: 600, display: "block", textAlign: "right" },
		{
			tag: t.comment,
			fontStyle: "italic",
			display: "block",
			textAlign: "center",
		},
		{
			tag: t.propertyName,
			color: "#225",
			display: "block",
			textAlign: "center",
		},
		{ tag: t.string, color: "#252", display: "block", textAlign: "center" },
	]);

	/// A language provider that provides JSON parsing.
	fountainLanguage = StreamLanguage.define({
		name: "fountain",
		startState: () => ({
			inDialogue: false,
		}),
		token: this.tokenize,
		blankLine: this.handleBlank,
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

	tokenTypes = {
		"scene-heading":
			/^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
		// scene_number: /( *#(.+)# *)/,

		character: /^\s*[A-Z][A-Z0-9 \t]+$/,
		dialogue: /^\s*(\^?)?(?:\n(?!\n+))([\s\S]+)/,
		parenthetical: /^(\(.+\))$/,

		centered: /^>[^<>\n]+<$/g,
		transition: /^(>[^<\n\r]*|[A-Z ]+ TO:)$/,

		// section: /^(#+)(?: *)(.*)/,
		synopsis: /^(?:\=(?!\=+) *)(.*)/,

		// note: /^(?:\[{2}(?!\[+))(.+)(?:\]{2}(?!\[+))$/,
		// note_inline: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,
		// boneyard: /(^\/\*|^\*\/)$/g,

		page_break: /^\={3,}$/,
		// line_break: /^ {2}$/,
	};

	tokenize(stream, state) {
		stream.skipToEnd();
		// if (stream.string.includes("<")) {
		//   const r = tokenTypes["centered"].test(stream.string);
		//   console.log(r);
		// }
		for (const type in this.tokenTypes) {
			if (this.tokenTypes[type].test(stream.string)) {
				if (type === "character") {
					state.inDialogue = true;
				}
				// console.log(3, type, stream.string);
				return type;
			}
		}

		if (state.inDialogue) {
			// console.log(3, "dialogue", stream.string);
			return "dialogue";
		}
		// console.log(3, "action", stream.string);

		// Action by default
		return "action";
	}

	handleBlank(state, indentLevel) {
		state.inDialogue = false;
	}

	fountain() {
		return new LanguageSupport(this.fountainLanguage);
	}
}
