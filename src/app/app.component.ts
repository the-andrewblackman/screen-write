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

	toggleShortcutsList(): void {
		this.isShortcutsListVisible = !this.isShortcutsListVisible;
	}

	ngAfterViewInit(): void {
		this.editorView = this.setupEditor(); // Store the EditorView instance

		Vim.map("jj", "<Esc>", "insert"); // in insert mode
		Vim.map("k", "BILL", "insert");
		this.editorView.focus();
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
				//EditorView.lineWrapping,
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
	text = `EXT. BRICK'S PATIO - DAY

A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.
	
= These are some editor's notes
	
The SCREEN DOOR slides open and DICK STEEL, his former partner and fellow retiree, emerges with two cold beers.
	
STEEL
Beer's ready!
	
= some more!
	
BRICK
Are they cold?
	
STEEL
Does a bear crap in the woods?
	
Steel sits.  They laugh at the dumb joke.

STEEL
(beer raised)
To retirement.

BRICK
To retirement.

They drink long and well from the beers.

And then there's a long beat.
Longer than is funny.
Long enough to be depressing.

The men look at each other.

STEEL
Screw retirement.

BRICK ^
Screw retirement.

SMASH CUT TO:

INT. TRAILER HOME - DAY

This is the home of THE BOY BAND, AKA DAN and JACK.  They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.

	JACK
	(in Vietnamese, subtitled)
*Did you know Brick and Steel are retired?*

	DAN
Then let's retire them.
_Permanently_.

Jack begins to argue vociferously in Vietnamese (?), But mercifully we...

		CUT TO:

EXT. BRICK'S POOL - DAY

Steel, in the middle of a heated phone call:

STEEL
They're coming out of the woodwork!
(pause)
No, everybody we've put away!
(pause)
Point Blank Sniper?

.SNIPER SCOPE POV

From what seems like only INCHES AWAY.  _Steel's face FILLS the *Leupold Mark 4* scope_.

STEEL
The man's a myth!

Steel turns and looks straight into the cross-hairs.

STEEL
(oh crap)
Hello...

CUT TO:

.OPENING TITLES

> BRICK BRADDOCK <
> & DICK STEEL IN <

> BRICK & STEEL <
> FULL RETIRED <

===

SMASH CUT TO:

EXT. WOODEN SHACK - DAY

COGNITO, the criminal mastermind, is SLAMMED against the wall.

COGNITO
Woah woah woah, Brick and Steel!

Sure enough, it's Brick and Steel, roughing up their favorite usual suspect.

COGNITO
What is it you want with me, DICK?

Steel SMACKS him.

STEEL
Who's coming after us?

COGNITO
Everyone's coming after you mate!  Scorpio, The Boy Band, Sparrow, Point Blank Sniper...

As he rattles off the long list, Brick and Steel share a look.  This is going to be BAD.

CUT TO:

INT. GARAGE - DAY

BRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.  They pause for a beat, the gravity of the situation catching up with them.

BRICK
This is everybody we've ever put away.

STEEL
(starting the engine)
So much for retirement!

They speed off.  To destiny!

CUT TO:

EXT. PALATIAL MANSION - DAY

An EXTREMELY HANDSOME MAN drinks a beer.  Shirtless, unfortunately.

His minion approaches offscreen:

MINION
We found Brick and Steel!

HANDSOME MAN
I want them dead.  DEAD!

Beer flies.

> BURN TO PINK.

> THE END <`;
}
