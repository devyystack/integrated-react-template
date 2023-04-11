# update tips


# search tips
farmersworld crop breed animal cow chicken
mainnet / testnet
softgiant123
atomicHub

// main
// test
// updated by
// added by
// should be updated


# replace tips
Food : Oxygen    // energy
Gold : Plasma    // repair and craft
Wood : Asteroid  // craft
?? meat

FWG : GMP
FWW : GMA
FWF : GMO

farmerstoken : galaxytoken

crop : box  Crop, CROP
breed : produce
animal : star
cow : dog
chicken : fox
meat : plasmax
building : station
feed : give
calf : wolf
egg : sheep
hatch : inspire
e21ab0
# change log in UI
rarity : uniqueness
reward rate : prize
charge time : cost time
Energy Consumed : Mining energy
Durability Consumed : Resilience

Mine : Mining
Repair : Restore
Remove : Detach
Wear : Equip


Not used tables: animals, breedings, crops

# change table names
accounts_table => players_table       accounts => players   newuser => addplayer
partners_table => friends_table       partners => friends
mbs_table => badges_table             mbs => badges
tools_table => gadgets_table            tools => gadgets
toolconfigs_table => configtools_table    toolconfs => configtools  settoolconf => addconftool  
itemconf_table => configitem_table      itemconf => configitem   setitemconf => addconfitem  rmitemconf => delconfitem
config_table => setting_table         config => setting          setconfig => addsetting    removeconfig => delsetting
mbsconf_table => tmconf_table    mbsconfig => tmconfig   setmbsconf => settmconf  rmmbsconf => deltmconf
mbscraft_table => tmcraft_table    mbscraft => tmcraft     setmbscraft => settmcraft  
tassets_table => tempassets_table     tassets => tempassets      mintasset => tassetmint
mktconf_table => configmarket_table    mktconf => configmarket   setmktconf => addconfmkt  rmmktconf => delconfmkt



# create addconftool table
Template: #324902
name Plasma Ionizer
img QmYa7A6PbVQ4cKmDHhx9bwyXgqKnK8uQBXtrHJQkp1CAvS
Type Plasma
Rarity Epic

Template: #324901
name Plasma Collector
img QmTuUVEHhrF1SFqv88t4ZirmirKWoYeTLSGB33QyJ1LQ2P
Type Plasma
Rarity Rare 

Template: #324900
name Oxygen Tank
img QmdZGYwaAVSAyNuALGsjFGm2L2U4Nnyf45bCYQezzNcQgC
Type Oxygen
Rarity Rare

Template: #324899
name Oxygen Backpack
img QmcRNXmcmuYrhFiicq8qqiuZMGHpTtwBeCk3cfqKgJ9WD3
Type Oxygen
Rarity Uncommon

Template: #324898
name Oxygen Jar
img QmR9NQTfKRtCrhAyVm4UZtimPABQVnXcJW49VcmLmPqiWv
Type Oxygen
Rarity Common

Template: #324897
name Asteroid Drone
img QmV19iux815PxCHY4U9oBfAwFqotTaxW8aavpNAKva18yF
Type Asteroid
Rarity Epic

Template: #324896
name Asteroid Dissolver
img QmSkRrAYPQK7WaAKpwYuqa7eSqrXGtcshWy3CKgER5y2Gv
Type Asteroid
Rarity Rare

Template: #324895
name Asteroid Clever
img Qmc5wLioPQwhNh7GcP35gRs1upoLHeZNBur25hGSAUnvFh
Type Asteroid
Rarity Uncommon

Template: #324894
name Asteroid Clever
img Qmc5wLioPQwhNh7GcP35gRs1upoLHeZNBur25hGSAUnvFh
Type Asteroid
Rarity Uncommon

Template: #324893
name Asteroid Scanner
img QmbKNCgPFkzAAPPGY1zPGRHggWRuUN31gzEn5rFhg6mPtH
Type Asteroid
Rarity Common



template_name: Plasma Ionizer
img: QmYa7A6PbVQ4cKmDHhx9bwyXgqKnK8uQBXtrHJQkp1CAvS
schema_name: tools
type: Plasma
rarity: Epic
level: 1
template_id: 324902
energy_consumed: 40
durability_consumed: 10 	
mints: [ "400.0000 PLASMA", "2400.0000 ASTEROID" ]
rewards: [ "15.0000 PLASMA" ]
charged_time: 60

########################################################################################################	
template_name	img  schema_name (key)   type	rarity	level	template_id	energy_consumed	durability_consumed	mints	rewards	charged_time
1	Oxygen Jar	QmR9NQTfKRtCrhAyVm4UZtimPABQVnXcJW49VcmLmPqiWv	tools	Oxygen	Common	1	324898	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "3.0000 OXYGEN" ]	3600
7	Oxygen Backpack	QmcRNXmcmuYrhFiicq8qqiuZMGHpTtwBeCk3cfqKgJ9WD3	tools	Oxygen	Uncommon	1	324899	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 OXYGEN" ]	3600
9	Oxygen Tank	QmdZGYwaAVSAyNuALGsjFGm2L2U4Nnyf45bCYQezzNcQgC	tools	Oxygen	Rare	1	324900	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 OXYGEN" ]	3600

2	Asteroid Drone	QmV19iux815PxCHY4U9oBfAwFqotTaxW8aavpNAKva18yF	tools	Asteroid	Epic	1	324897	60	50	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "42.0000 ASTEROI" ]	3600
3	Plasma Ionizer	QmYa7A6PbVQ4cKmDHhx9bwyXgqKnK8uQBXtrHJQkp1CAvS	tools	Plasma	Epic	1	324902	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 PLASMA" ]	3600
4	Asteroid Dissolver	QmSkRrAYPQK7WaAKpwYuqa7eSqrXGtcshWy3CKgER5y2Gv	tools	Asteroid	Rare	1	324896	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 ASTEROI" ]	3600
6	Asteroid Scanner	QmbKNCgPFkzAAPPGY1zPGRHggWRuUN31gzEn5rFhg6mPtH	tools	Asteroid	Common	1	324893	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 ASTEROI" ]	3600
8	Asteroid Clever	Qmc5wLioPQwhNh7GcP35gRs1upoLHeZNBur25hGSAUnvFh	tools	Asteroid	Uncommon	1	324894	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 ASTEROI" ]	3600

5	Plasma Collector	QmTuUVEHhrF1SFqv88t4ZirmirKWoYeTLSGB33QyJ1LQ2P	tools	Plasma	Rare	1	324901	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 PLASMA" ]	3600
10		QmYa7A6PbVQ4cKmDHhx9bwyXgqKnK8uQBXtrHJQkp1CAvS	tools	Plasma	Epic	1	324902	40	10	[ "400.0000 PLASMA", "2400.0000 ASTEROI" ]	[ "15.0000 PLASMA" ]	3600

