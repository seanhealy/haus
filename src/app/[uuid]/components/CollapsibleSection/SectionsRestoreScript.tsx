import { sectionsCookieName } from "../../sectionsCookie";

// Applies the saved open/closed state before first paint (no flash) on a full
// load; soft navigations restore via SectionOpenPersister. Keep the script body
// a static constant with no interpolation — the cookie name comes from a data
// attribute — so it stays injection-free and CSP-noncing is enough to secure it.
const RESTORE_SECTIONS = `(function(){var s=document.currentScript;if(!s)return;var p=s.dataset.sectionsCookie+'=';var raw=null;var c=document.cookie?document.cookie.split('; '):[];for(var i=0;i<c.length;i++){if(c[i].indexOf(p)===0){raw=c[i].slice(p.length);break;}}var state={};if(raw!==null){try{var v=JSON.parse(decodeURIComponent(raw));if(v&&typeof v==='object'&&!Array.isArray(v))state=v;}catch(e){}}var items=document.querySelectorAll('details[data-section-id]');for(var j=0;j<items.length;j++){var id=items[j].getAttribute('data-section-id');items[j].open=Object.prototype.hasOwnProperty.call(state,id)?!!state[id]:true;}})();`;

export function SectionsRestoreScript({ uuid }: { uuid: string }) {
	return (
		<script
			data-sections-cookie={sectionsCookieName(uuid)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static script with no interpolation; see note above
			dangerouslySetInnerHTML={{ __html: RESTORE_SECTIONS }}
		/>
	);
}
