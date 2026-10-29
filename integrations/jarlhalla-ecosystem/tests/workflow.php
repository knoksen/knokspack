<?php
require dirname(__DIR__) . '/workflow.php';
use function Jarlhalla\Ecosystem\initial_state;
use function Jarlhalla\Ecosystem\transition;
$checks = 0;
function check($truth, $label) { global $checks; if (!$truth) throw new RuntimeException($label); $checks++; }
function input($s, $overrides=[]) { return array_merge(array_intersect_key($s, array_flip(['revision','stage','area','owner','due','task_url'])), ['note'=>''], $overrides); }
function rejects($s, $overrides, $label) {
    try { transition($s, input($s,$overrides), 1, '2026-10-28T23:00:00Z'); }
    catch (DomainException $e) { check(true,$label); return; }
    check(false,$label);
}
$s=initial_state();
check(transition($s,input($s),1,'now') === $s, 'Idempotent unchanged save');
rejects($s,['stage'=>'active','owner'=>1], 'Cannot skip triage');
rejects($s,['revision'=>2], 'Stale editor refused');
rejects($s,['revision'=>[]], 'Array input refused');
rejects($s,['area'=>'invented'], 'Unknown routing refused');
rejects($s,['due'=>'2026-02-30'], 'Impossible dates refused');
foreach (['http://notion.so/x','https://notion.so.evil.example/x','https://notion.so@evil.example/x','javascript:alert(1)','https://notion.so:999/x'] as $url) rejects($s,['task_url'=>$url], 'Unsafe task URL refused');
$s=transition($s,input($s,['stage'=>'triage','area'=>'building']),1,'2026-10-28T23:00:00Z');
rejects($s,['stage'=>'active'], 'Work requires owner');
$s=transition($s,input($s,['stage'=>'active','owner'=>7,'due'=>'2026-11-01','task_url'=>'https://app.notion.com/p/example']),1,'2026-10-28T23:01:00Z');
check($s['area']==='building' && $s['owner']===7 && $s['revision']===2,'Routing and owner persisted');
rejects($s,['stage'=>'closed','note'=>'done'], 'Cannot skip delivery');
$s=transition($s,input($s,['stage'=>'waiting','note'=>'<script>test</script>']),1,'2026-10-28T23:02:00Z');
check($s['history'][2]['note']==='test','Markup stripped from notes');
$s=transition($s,input($s,['stage'=>'active']),1,'2026-10-28T23:03:00Z');
$s=transition($s,input($s,['stage'=>'delivered']),1,'2026-10-28T23:04:00Z');
rejects($s,['stage'=>'closed'], 'Closure needs evidence note');
$s=transition($s,input($s,['stage'=>'closed','note'=>'Levert og kontrollert']),1,'2026-10-28T23:05:00Z');
check(count($s['history'])===6 && $s['revision']===6,'Full lifecycle preserves history');
$s=transition($s,input($s,['stage'=>'triage','note'=>'Gjenåpnet']),1,'2026-10-28T23:06:00Z');
check($s['stage']==='triage' && count($s['history'])===7,'Reopen preserves prior events');
$registry=json_decode(file_get_contents(dirname(__DIR__).'/registry.json'),true,512,JSON_THROW_ON_ERROR);
$ids=[];
foreach($registry['initiatives'] as $item) {
    check((bool)preg_match('/^[a-z0-9-]+$/D',$item['id']) && !isset($ids[$item['id']]),'Stable unique registry ID');
    $ids[$item['id']]=true;
    check($item['availability']==='existing-link' || $item['url']===null,'Unverified app endpoints remain hidden');
}
echo "PASS $checks workflow and registry checks\n";
