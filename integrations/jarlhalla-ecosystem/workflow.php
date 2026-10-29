<?php
namespace Jarlhalla\Ecosystem;
/** Pure state machine; no network, WordPress dependency or secret handling. */
function initial_state(): array {
    return ['revision'=>0, 'stage'=>'new', 'area'=>'general', 'owner'=>0, 'due'=>'', 'task_url'=>'', 'history'=>[]];
}
function transition(array $state, array $input, int $actor, string $now): array {
    foreach (['revision','stage','area','owner','due','task_url','note'] as $key) {
        if (!array_key_exists($key, $input) || !is_scalar($input[$key])) throw new \DomainException('Ufullstendig saksflyt.');
    }
    if (!preg_match('/^\d+$/D', (string) $input['revision']) || (int) $input['revision'] !== $state['revision']) {
        throw new \DomainException('Saken har en nyere versjon. Last siden på nytt.');
    }
    $allowed = ['new'=>['new','triage'], 'triage'=>['triage','active','waiting','closed'],
        'active'=>['active','waiting','delivered'], 'waiting'=>['waiting','triage','active','closed'],
        'delivered'=>['delivered','active','closed'], 'closed'=>['closed','triage']];
    if (!in_array($input['stage'], $allowed[$state['stage']], true)) throw new \DomainException('Ugyldig statusovergang. Bruk avklaring før arbeid og levering før lukking.');
    if (!in_array($input['area'], ['general','building','sustainability','ai','creative','research','community','learning','labs','publishing'], true)) throw new \DomainException('Ukjent fagområde.');
    if (!preg_match('/^\d+$/D', (string) $input['owner'])) throw new \DomainException('Ugyldig ansvarlig.');
    if (in_array($input['stage'], ['active','delivered'], true) && !(int) $input['owner']) throw new \DomainException('Saken må ha ansvarlig før arbeid eller levering.');
    if ($input['due'] !== '') {
        $d = \DateTimeImmutable::createFromFormat('!Y-m-d', (string) $input['due']);
        if (!$d || $d->format('Y-m-d') !== $input['due']) throw new \DomainException('Ugyldig oppfølgingsdato.');
    }
    $url = trim((string) $input['task_url']);
    $parts = parse_url($url);
    if ($url !== '' && (!$parts || ($parts['scheme'] ?? '') !== 'https' ||
        !in_array($parts['host'] ?? '', ['notion.so','www.notion.so','app.notion.com','www.notion.com'], true) ||
        isset($parts['user']) || isset($parts['pass']) || isset($parts['port']) || strlen($url) > 2048)) {
        throw new \DomainException('Bruk en HTTPS-lenke til eksisterende Notion-oppgave.');
    }
    $note = trim(strip_tags((string) $input['note']));
    if (strlen($note) > 8000) throw new \DomainException('Notatet er for langt.');
    $next = $state;
    foreach (['stage','area','due'] as $key) $next[$key] = (string) $input[$key];
    $next['owner'] = (int) $input['owner']; $next['task_url'] = $url;
    if ($next === $state && $note === '') return $state;
    if ($input['stage'] === 'closed' && $state['stage'] !== 'closed' && $note === '') throw new \DomainException('Skriv avslutningsnotat før saken lukkes.');
    if (count($state['history']) >= 500) throw new \DomainException('Historikken må arkiveres kontrollert før flere endringer.');
    $next['revision']++;
    $next['history'][] = ['at'=>$now, 'actor'=>$actor, 'stage'=>$next['stage'], 'area'=>$next['area'],
        'owner'=>$next['owner'], 'due'=>$next['due'], 'task_url'=>$next['task_url'], 'note'=>$note];
    return $next;
}
