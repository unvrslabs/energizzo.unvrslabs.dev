-- Migration: seed_batch_00
-- Version: 20260419174156
-- Dumped via MCP Supabase on 2026-04-23

insert into public.leads (ragione_sociale,piva,id_arera,tipo_servizio,comune,provincia,indirizzo,dominio,sito_web,email_info,email_commerciale,telefoni,gruppo,natura_giuridica,settori,latitude,longitude) values
('+Energia','01244170526','1686','Dual (Ele+Gas)','Foligno','Perugia','Via Fedeli 2 - Foligno ( Perugia )','piuenergia.it','http://www.piuenergia.it','info@piuenergia.it','commerciale@piuenergia.it','0742/20813-0742/321596-0742/320233','NESSUNO','Società per azioni (S.p.a.)','i) vendita ai clienti liberi dell''energia elettrica; t) vendita di gas naturale ai clienti finali a condizioni di libero mercato',42.95488,12.70268),
('1.618','07885151006','23785','Solo Elettrico','Roma','Roma','Piazza di Campitelli 2 - Roma ( Roma )','1-618.it','http://1-618.it/it/energia','info@1-618.it','commerciale@1-618.it','069406599','NESSUNO','Società a responsabilita limitata (S.r.l.)','i) vendita ai clienti liberi dell''energia elettrica',41.89193,12.51133)
on conflict (piva) do nothing;;
