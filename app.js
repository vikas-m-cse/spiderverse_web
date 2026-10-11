import { createClient } from '@supabase/supabase-js';

// Configure these public values after creating your Supabase project.
// Use only the browser-safe publishable/anon key — never the service-role key.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

const demoTeams = [
  ['A81C2D10','Neon Sentinels',96,94],['B72E4F21','Pixel Raiders',91,91],
  ['C63F5A32','Code Titans',89,88],['D54A6B43','Quantum Crew',87,85],
  ['E45B7C54','Ctrl Alt Elite',79,86],['F36C8D65','Syntax Syndicate',82,78],
  ['G27D9E76','Byte Bandits',74,78],['H18E0F87','Null Pointers',70,68]
].map(([id,team_name,round1_score,round2_score])=>({id,team_name,round1_score,round2_score,created_at:new Date().toISOString()}));

let teams = demoTeams;
let isAdmin = false;
let toastTimer;
const $ = id => document.getElementById(id);
const score = t => Number(t.round1_score||0)+Number(t.round2_score||0);
const number = n => new Intl.NumberFormat('en-IN').format(Number(n||0));
const safe = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const code = t => String(t.id||'').replaceAll('-','').slice(0,8).toUpperCase();
const sorted = () => [...teams].sort((a,b)=>score(b)-score(a)||String(a.team_name).localeCompare(String(b.team_name)));
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3200)}
function message(id,s,error=false){$(id).textContent=s;$(id).classList.toggle('error',error)}
function setMode(s,live=false){$('connectionText').textContent=s;const dot=document.querySelector('.top-status .pulse');if(dot){dot.style.background=live?'var(--acid)':'#f3be56';dot.style.boxShadow=live?'0 0 12px #c8ff3555':'none'}}
function render(){
 const list=sorted(),q=$('teamSearch').value.trim().toLowerCase(),shown=list.filter(t=>String(t.team_name).toLowerCase().includes(q)||code(t).toLowerCase().includes(q));
 $('teamCount').textContent=String(teams.length).padStart(2,'0');
 $('totalPoints').textContent=number(teams.reduce((n,t)=>n+score(t),0));
 $('resultsCount').innerHTML=shown.length.toString().padStart(2,'0')+' TEAMS <b>·</b> SORTED BY FINAL SCORE';
 $('leaderboardBody').innerHTML=shown.map(t=>{const rank=list.findIndex(x=>x.id===t.id)+1,initials=String(t.team_name||'T').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();return '<tr><td class="rank-cell"><span class="rank-number '+(rank===1?'top-one':'')+'">'+String(rank).padStart(2,'0')+'</span><span class="team-id">ID / '+safe(code(t))+'</span></td><td><div class="team-cell"><span class="team-avatar">'+safe(initials)+'</span><span>'+safe(t.team_name)+'</span>'+(rank===1?'<span class="rank-badge">LEADING</span>':'')+'</div></td><td class="numeric">'+number(t.round1_score)+'</td><td class="numeric">'+number(t.round2_score)+'</td><td class="numeric final-score">'+number(score(t))+'</td></tr>'}).join('');
 $('emptyState').classList.toggle('hidden',shown.length>0);$('leaderboardBody').classList.toggle('hidden',shown.length===0);
 $('updatedClock').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
 $('lastUpdated').textContent=supabase?'LIVE SYNC ENABLED':'DEMO DATA / NOT CONNECTED';
 const prev=$('scoreTeam').value;
 $('scoreTeam').innerHTML=list.map(t=>'<option value="'+safe(t.id)+'">'+safe(t.team_name)+' · '+number(score(t))+' pts</option>').join('');
 if(list.some(t=>String(t.id)===prev))$('scoreTeam').value=prev;
 syncScores();
}
async function loadTeams(quiet=false){
 if(!supabase){setMode('DEMO MODE');render();if(!quiet)toast('Demo mode — set up Supabase to share real standings.');return}
 setMode('CONNECTING…');
 const {data,error}=await supabase.from('teams').select('id,team_name,round1_score,round2_score,created_at');
 if(error){console.error(error);setMode('CHECK CONNECTION');if(!quiet)toast('Could not load teams. Check Supabase setup and RLS.');return}
 teams=data||[];setMode('SUPABASE LIVE',true);render()
}
function open(id){$(id).showModal()}
function close(id){$(id).close()}
function syncScores(){const t=teams.find(x=>String(x.id)===$('scoreTeam').value);if(t){$('roundOneInput').value=Number(t.round1_score||0);$('roundTwoInput').value=Number(t.round2_score||0)}}
function showAdmin(show,name=''){isAdmin=show;$('adminLoginFields').classList.toggle('hidden',show);$('adminPanel').classList.toggle('hidden',!show);if(show)$('adminIdentity').textContent='SIGNED IN · '+name}
async function checkSession(){
 if(!supabase)return;
 const {data:{session}}=await supabase.auth.getSession();isAdmin=false;
 if(session?.user){const {data}=await supabase.from('admins').select('user_id,display_name,role').eq('user_id',session.user.id).maybeSingle();if(data&&['admin','judge'].includes(data.role)){showAdmin(true,data.display_name||session.user.email);return}}
 showAdmin(false)
}
async function registerTeam(e){
 e.preventDefault();const name=$('teamName').value.trim().replace(/\s+/g,' ');
 if(name.length<2){message('registerMessage','Team name must be at least 2 characters.',true);return}
 if(teams.some(t=>String(t.team_name).trim().toLowerCase()===name.toLowerCase())){message('registerMessage','That team name already exists.',true);return}
 if(!supabase){teams.push({id:crypto.randomUUID(),team_name:name,round1_score:0,round2_score:0,created_at:new Date().toISOString()});render();close('registerDialog');$('registerForm').reset();toast('Added to this demo only — not saved to Supabase.');return}
 const {data:{user}}=await supabase.auth.getUser();
 if(!user){message('registerMessage','For real registration, the captain must first sign in with Supabase Auth.',true);return}
 const {error}=await supabase.from('teams').insert({team_name:name,captain_id:user.id});
 if(error){message('registerMessage',error.code==='23505'?'That team name is already registered.':'Registration failed: '+error.message,true);return}
 close('registerDialog');$('registerForm').reset();await loadTeams(true);toast('Team registered successfully.')
}
async function login(e){
 e.preventDefault();if(!supabase){message('adminMessage','Supabase is not configured. Demo mode has no admin password and cannot securely edit scores.',true);return}
 message('adminMessage','Signing in…');const {data,error}=await supabase.auth.signInWithPassword({email:$('adminEmail').value.trim(),password:$('adminPassword').value});
 if(error){message('adminMessage','Sign-in failed. Check credentials and Supabase Auth settings.',true);return}
 const {data:profile}=await supabase.from('admins').select('user_id,display_name,role').eq('user_id',data.user.id).maybeSingle();
 if(!profile||!['admin','judge'].includes(profile.role)){await supabase.auth.signOut();message('adminMessage','Not authorised. Add this user UUID to public.admins first.',true);return}
 showAdmin(true,profile.display_name||data.user.email);await loadTeams(true);toast('Secure admin session started.')
}
async function saveScores(){
 if(!supabase||!isAdmin){message('adminMessage','Only an authenticated admin/judge can change scores.',true);return}
 const id=$('scoreTeam').value,r1=Number($('roundOneInput').value),r2=Number($('roundTwoInput').value);
 if(!id||!Number.isInteger(r1)||!Number.isInteger(r2)||r1<0||r2<0||r1>100000||r2>100000){message('adminMessage','Use whole-number scores from 0 to 100,000.',true);return}
 $('saveScoresBtn').disabled=true;message('adminMessage','Saving…');
 const {error}=await supabase.from('teams').update({round1_score:r1,round2_score:r2}).eq('id',id);
 $('saveScoresBtn').disabled=false;if(error){message('adminMessage','Update denied: '+error.message,true);return}
 message('adminMessage','Scores saved. Rankings will refresh automatically.');await loadTeams(true);toast('Scores updated.')
}
async function logout(){if(supabase)await supabase.auth.signOut();showAdmin(false);message('adminMessage','Signed out.');toast('Admin signed out.')}
$('adminOpen').addEventListener('click',async()=>{open('adminDialog');await checkSession()});
['registerOpen','bannerRegister','emptyRegister'].forEach(id=>$(id).addEventListener('click',()=>{message('registerMessage','');open('registerDialog')}));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>close(b.dataset.close)));
['registerDialog','adminDialog'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===$(id))close(id)}));
$('registerForm').addEventListener('submit',registerTeam);$('adminForm').addEventListener('submit',login);$('saveScoresBtn').addEventListener('click',saveScores);$('signOutBtn').addEventListener('click',logout);$('scoreTeam').addEventListener('change',syncScores);$('teamSearch').addEventListener('input',render);$('refreshBtn').addEventListener('click',()=>loadTeams());
render();
if(supabase){loadTeams(true);supabase.channel('teams-live').on('postgres_changes',{event:'*',schema:'public',table:'teams'},()=>loadTeams(true)).subscribe();supabase.auth.onAuthStateChange(()=>checkSession())}
