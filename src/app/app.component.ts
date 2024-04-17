import {
	Component,
	AfterViewInit,
	ViewChild,
	ElementRef,
	Renderer2,
} from "@angular/core";
import { defaultKeymap } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { fountain, fountainHighlight } from "./formatter/fountain"; // Adjust the import path based on where you placed the file
import { syntaxHighlighting } from "@codemirror/language";
import { minimalSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { Vim, vim, getCM } from "@replit/codemirror-vim";
import { ChangeSet, Transaction } from "@codemirror/state";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
	@ViewChild("editorContainer") editorContainer: ElementRef<HTMLDivElement>;
	private editorView: EditorView; // Declare the EditorView instance here

	isShortcutsListVisible = false;
	isVimListVisible = false;
	keyMappingUpEnabled: boolean = false;
	keyMappingDownEnabled: boolean = false;

	toggleShortcutsList(): void {
		this.isShortcutsListVisible = !this.isShortcutsListVisible;
	}
	toggleVimList(): void {
		this.isVimListVisible = !this.isVimListVisible;
	}

	ngAfterViewInit(): void {
		this.editorView = this.setupEditor(); // Store the EditorView instance

		Vim.map("jj", "<Esc>", "insert"); // in insert mode
		this.editorView.focus();
	}
	toggleKeyUpMapping() {
		if (this.keyMappingUpEnabled) {
			Vim.map("k", "gk");
		} else {
			Vim.unmap("k");
		}
		this.editorView.update([]);
	}
	toggleKeyDownMapping() {
		if (this.keyMappingDownEnabled) {
			Vim.map("j", "gj");
		} else {
			Vim.unmap("j");
		}
		this.editorView.update([]);
	}

	setupEditor() {
		const myTheme = EditorView.theme({
			"&": {
				// Ensure the editor itself is centered within its container
				margin: "auto",
			},
			"& .cm-line": {
				paddingLeft: "10em", // Adds padding to the left of each line
				paddingRight: "10em", // Adds padding to the right of each line
			},
			// Add additional styling as needed for focused state
			"&.cm-focused": {
				outline: "none", // Remove the outline on focus if desired
			},
		});

		const state = EditorState.create({
			doc: this.text,
			extensions: [
				EditorView.lineWrapping, // Ensure line wrapping is enabled
				fountain(),
				vim(),
				minimalSetup,
				syntaxHighlighting(fountainHighlight),
				myTheme,
				keymap.of([
					...defaultKeymap,
					{
						key: "Mod-s",
						run: () => {
							this.saveToFile();
							return true;
						},
					},
				]),
				// keymap.of([{ key: "Tab", run: indentWithTab }]),
				//keymap.of([indentWithTab]),
			],
		});
		const editorView = new EditorView({
			state,
			parent: this.editorContainer.nativeElement,
		});
		return editorView;
	}

	saveToFile(): void {
		if (this.editorView) {
			const myEditorContent = this.editorView.state.doc.toString();

			if (myEditorContent) {
				const blob = new Blob([myEditorContent], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "screenplay.fountain"; // Change the file extension if needed
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else {
				console.error("Editor content is empty.");
			}
		} else {
			console.error("Editor is not initialized.");
		}
	}
	text = `FADE IN:

EXT. A CITY STREET - DAY

Camera tracks down a snow-covered New York City street. We hold on a typical Brownstone. As we push in on an upstairs bedroom window, we hear the sounds of a video game in progress.

A sick coughing sound is heard.

INT. BROWNSTONE - BEDROOM
	
This kid lying in bed, coughing. Pale, one sick cookie. Maybe he's seven or eight or nine. He holds a remote in one hand, presses it, and the video game moves a little bit. Then he's hit by another spasm of coughing, sets the remote down.

His room is monochromatic, greys and blues, mildly high-tech. 

The Kid's MOTHER enters, goes to him, fluffs his pillows, kisses him, and briefly feels his forehead. She's worried, it doesn't show. 

MOTHER
You feeling any better?

THE KID
A little bit.

MOTHER
Guess what.

THE KID
What?

MOTHER
Your grandfather's here.

THE KID
(not overjoyed)
Mom, can't you tell him that I'm sick?

MOTHER
You are sick, that's why he's here.

THE KID
He'll pinch my cheek. I hate that.

MOTHER
Maybe he won't.

The Kid shoots her an "I'm sure" look, as the Kid's GRANDFATHER bursts into the room. Kind of rumpled. But the eyes are bright. He has a wrapped package tucked under one arm as he immediately goes to The Kid, pinches his cheek.

GRANDFATHER
Hey! How's the sickie? Heh?

The Kid gives his Mother an "I told you so" look. The Mother ignores it, beats a retreat.

MOTHER
I think I'll leave you two pals.

And she is gone. There's an uncomfortable silence, then...

GRANDFATHER
I brought you a special present.

THE KID
What is it?

GRANDFATHER
Open it up.

The Kid does. He does his best to smile.

THE KID
A book?

GRANDFATHER
That's right. When I was your age, television was called books. And this is a special book. It was the book my father used to read to me when I was sick, and I used to read it to your father. And today, I'm gonna read it to you.

THE KID
Has it got any sports in it?

The Grandfather suddenly passionate.

GRANDFATHER
Are you kidding? Fencing. Fighting. Torture. Revenge. Giants. Monsters. Chases. Escapes. True love. Miracles.  
	
The Grandfather sits in a chair by the bed.
	
THE KID
(manages a shrug)
It doesn't sound too bad. I'll try and stay awake.

GRANDFATHER
Oh. Well, thank you very much.  It's very nice of you. Your vote of confidence is overwhelming.  All right.  
(he begins to read.) 
The Princess Bride, by S.  Morgenstern. Chapter One.  Buttercup was raised on a small farm in the country of Florin.

DISSOLVE TO:

EXT. COUNTRYSIDE - DAY
As he reads, the monochromatic look of the bedroom is replaced by the dazzling color of the English countryside.

GRANDFATHER (O.S.)
Her favorite pastimes were riding her horse and tormenting the farm boy that worked there. His name was Westley, but she never called him that.
(to the kid)
Isn't that a wonderful beginning?

THE KID (O.S.)
(doing his best)
Yeah. It's really good.

GRANDFATHER (O.S.)
(off-screen reading)
Nothing gave Buttercup as much pleasure as ordering Westley around.`;
}
