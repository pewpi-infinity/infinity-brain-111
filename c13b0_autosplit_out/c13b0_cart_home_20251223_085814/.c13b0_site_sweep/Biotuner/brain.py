import os, requests, random, re

SELF="brain.py"
URL="https://www.gutenberg.org/files/{}/{}-0.txt"
RANGE=(1,70000)

CATS={
 "CATS":["cat","kitten","feline"],
 "WATER":["water","river","lake","ocean"],
 "TREES":["tree","forest","wood","oak","pine"],
 "PEOPLE":["man","woman","person","child"]
}

def pull():
    b=random.randint(*RANGE)
    try:
        r=requests.get(URL.format(b,b),timeout=10)
        if r.status_code==200 and len(r.text)>200:
            return r.text
    except:
        return None

def split(t):
    return re.split(r'[.!?]\s+',t)

def sort(sent):
    out={k:[] for k in CATS}
    for s in sent:
        low=s.lower()
        for cat,words in CATS.items():
            if any(w in low for w in words):
                out[cat].append(s.strip())
    return out

def grow(data):
    with open(SELF,"a",encoding="utf-8") as f:
        f.write("\n#====BLOCK====\n")
        for cat,lines in data.items():
            if not lines: continue
            f.write(f"# {cat}\n")
            for line in lines[:50]:
                f.write(f"# {line}\n")

def main():
    t=pull()
    if not t: return
    s=split(t)
    c=sort(s)
    grow(c)

if __name__=="__main__":
    main()

#====BLOCK====
# CATS
# Sur le vaisseau qui les emportait,
se trouvaient Mlle Mance, revenant après sa guérison miraculeuse et
amenant trois soeurs hospitalières; les soeurs de Brésoles, Macé,
Maillet; la soeur Bourgeoys et les soeurs Aimée Chatel, Catherine Crolo
et Marie Raisin qui avec la soeur Bourgeoys formèrent le noyau de cette
congrégation de Notre-Dame qui a rendu à notre pays des services si
inappréciables, et près de deux cents passagers
# Le Maître, ils mirent sa tête
dans un mouchoir blanc, qu'apparemment ils avaient pris dans la poche du
défunt, et, l'ayant ainsi emportée dans son pays il arriva une merveille
qui mérite d'être décrite, pour votre édification
# Dollier de Casson, prêtre de Saint-Sulpice,
parlant d'un de ses confrères; cette réserve est bien naturelle et
pleine de délicatesse
# Ceux-ci virent de suite l'ennemi et
l'entendirent faire une grosse huée, ce qui effraya tellement nos gens
dont une partie n'était pas encore débarquée, que tous généralement ne
songèrent qu'à s'enfuir, s'oubliant ainsi de leur bravoure ordinaire."

Malheureusement, le chef de cette petite troupe Claude de Brigeac, jeune
gentilhomme de 30 ans, "venu à Villemarie comme soldat, par pur motif de
religion, dans l'intention d'y sacrifier sa vie pour l'établissement
de l'église catholique," et dont M
# Son but, comme celui de la plupart de ses compagnons,
n'était pas de conquérir des terres ou d'exploiter les richesses de ces
pays nouveaux, mais de gagner à Dieu les habitants idolâtres, et de
payer de tout son sang l'établissement de la foi catholique dans
ces régions où n'avaient régné jusqu'alors que les plus abjectes
superstitions
# La
mort de Lambert Closse, par suite des difficultés des communications,
ne fut connue à Québec qu'à la fin de mars; elle y excita, comme à
Montréal, des regrets universels
# WATER
# Cependant,
espérant toujours qu'il arriverait à se trouver avec les Iroquois et
qu'il pourrait exercer son zèle évangélique, il se mit sans tarder à
apprendre leur langue
# Dollier de Casson ajoute: "Je vous dirai qu'on m'a rapporté bien
d'autres choses assez extraordinaires à l'égard de la même personne,
dont une partie était comme les pronostics de ce qui devait lui arriver
un jour, et l'autre se rapportait à l'état des choses présentes et à
celui dans lequel apparemment toutes les choses seront bientôt
# de Brigeac pour qu'il pût arriver jusque dans leur pays
# Closse et prennent un
chemin détourné pour arriver sans être aperçus; mais ils ne purent si
bien faire que les ennemis ne les découvrissent; ce qu'ils marquèrent
aussitôt par des huées et des cris bien propres à effrayer les plus
braves
# Il commande
donc à sa petite troupe de forcer les Iroquois et d'arriver à la maison
coûte que coûte
# PEOPLE
# Sur le vaisseau qui les emportait,
se trouvaient Mlle Mance, revenant après sa guérison miraculeuse et
amenant trois soeurs hospitalières; les soeurs de Brésoles, Macé,
Maillet; la soeur Bourgeoys et les soeurs Aimée Chatel, Catherine Crolo
et Marie Raisin qui avec la soeur Bourgeoys formèrent le noyau de cette
congrégation de Notre-Dame qui a rendu à notre pays des services si
inappréciables, et près de deux cents passagers
# Ils soignèrent et assistèrent deux
Huguenots dont ils eurent le bonheur d'obtenir l'abjuration."

A cette affreuse maladie dont furent plus ou moins atteints presque tous
les passagers, se joignirent de terribles tempêtes et le manque d'eau
douce jusqu'à l'arrivée dans le Saint-Laurent
# de Maisonneuve, venu en France en l655, demanda à M
# Il avait pour eux la plus grande affection,
et, si quelques-uns d'entre eux paraissaient à Montréal, il usait des
facilités que lui donnaient ses fonctions d'économe pour leur faire des
largesses et leur donner à manger
# Le Maître eut
encore le courage de courir vers ses travailleurs en leur recommandant
de se retirer, puis il expira
# Le Maître, né en Normandie, était âgé de quarante-quatre ans quand il
fut tué
# "Quelque temps après, comme je me disposais pour aller en France, j'eus
la pensée de m'assurer de ce fait, afin que, si on me demandait si cela
était véritable, je susse ce que je devais en dire
# Il me dit que cela
était véritable, qu'il en était assuré, non pour l'avoir entendu dire,
mais pour l'avoir vu; qu'il avait promis tout ce qu'il avait pu aux
sauvages pour avoir ce mouchoir, les assurant que, quand il serait à
Montréal, il ne manquerait pas de les satisfaire: ce que cependant ils
ne voulurent pas accepter disant que ce mouchoir était pour eux un
pavillon pour aller en guerre, et qui les rendrait invincibles."

Dans les annales des hospitalières de Saint-Joseph nous lisons aussi:
"Après que les Iroquois eurent décapité M
# Cuillerier, personnes dignes de foi, ainsi qu'un père
jésuite, qui était prisonnier dans ce temps-là, dans une autre nation
que celle qui avait tué ce saint homme
# Le Maître),
car je vois sa face sur son mouchoir."

"Ces sauvages honteux et confus resserrèrent alors ce linge sans que
jamais depuis ils l'aient voulu montrer ni donner à personne, pas même
au R.P
# Dollier de Casson ajoute: "Je vous dirai qu'on m'a rapporté bien
d'autres choses assez extraordinaires à l'égard de la même personne,
dont une partie était comme les pronostics de ce qui devait lui arriver
un jour, et l'autre se rapportait à l'état des choses présentes et à
celui dans lequel apparemment toutes les choses seront bientôt
# D'autres, pendant ce temps, tirent sur un bateau et tuent plusieurs
personnes, entre autres deux braves fils de famille: J.-Bte Moyen, âgé
de 19 ans, et Joseph Duchesne, âgé de 20 ans, qui, sans faire attention
à ses blessures, exhortait son camarade à bien mourir, quand il tomba
lui-même raide mort dans le bateau
# Vignal
avait reçu des blessures si graves que les Iroquois renoncèrent bientôt
à le guérir, et voyant qu'ils ne pourraient l'amener jusques en leur
pays, ils le tuèrent deux jours après, le 27 octobre 1661, puis ayant
fait rôtir son corps sur un bûcher, ils le mangèrent
# Dollier de Casson, d'offrir à son créateur, le sacrifice
de son corps en odeur de suavité, étant brûlé sur un bûcher comme le
grain d'encens sur le charbon sans qu'il restât rien de son corps."

Cette _robe noire_ dont les sauvages voulaient faire leur plus beau
trophée et qui devait être la victime sur laquelle se serait exercée
leur cruauté, venant à leur manquer, ces bourreaux redoublèrent de soins
envers M
# Hierosme Lalemant fait du major Lambert
Closse dans la _Relation_ de 1662 en annonçant sa mort qu'il signale
comme une "perte notable" pour Montréal
# Lalemant nous pouvons dire
en toute vérité que Montréal et la Nouvelle-France doivent leur salut au
brave major Lambert Closse
# Il était
partout et partout il faisait des merveilles; il avait l'honneur de
commander en second la garnison de Villemarie
# Dollier de
Casson, soit de la mère Juchereau, que Lambert Closse se montrait
toujours et partout l'ami des braves et le fléau des poltrons, et qu'il
prenait le plus grand soin de ses soldats en les exerçant fréquemment au
maniement des armes
# Quant à lui, singulièrement habile à manier le
mousquet, il pouvait, par son adresse à se servir de cette arme, être
comparé à ces guerriers dont il est dit dans la Bible, qu'avec leur
fronde, ils auraient atteint jusqu'à un cheveu sans donner ni à droite
ni à gauche
# Il paraît même qu'il exerçait ses soldats non seulement à
tirer juste, mais à tirer toujours en face d'eux-mêmes de manière à tuer
le plus d'ennemis, en tirant chacun sur le sien
# de Maisonneuve, s'étant informé où étaient les
quatre hommes qui en avaient la garde, demanda à ceux du fort s'ils
laisseraient périr leurs camarades
# "Sans être alarmés de ces cris, ils s'encouragent à vendre leur vie bien
cher; et, afin de se battre à la manière des sauvages, chacun choisit un
arbre pour se cacher et essuyer le feu des ennemis
# Puis ces seize colons victorieux ramenèrent dans le fort, à
la vue des sauvages tremblants, les quatre soldats de la redoute."

Dans l'été de 1652, Mlle Mance, anxieuse de savoir des nouvelles de M
# Ayant
entendu ces mauvaises nouvelles, le major Closse laissa Mlle Mance
et remonta au plus vite à Montréal, où son retour fit renaître la
confiance, tant on faisait fond sur sa bravoure et son sang-froid
# Dieu bénisse le noble exemple que, dans
cette occasion, cette bonne personne a donné à tout le monde pour
la conservation de cette vertu
# Les Français avaient amené de France quelques dogues pour veiller, à
leur manière, à la sûreté du fort
# Lalemant, dans la _Relation_ de 1647, parle lui
aussi de l'instinct merveilleux et providentiel de ces dogues
# "Il y
avait dans Montréal, dit-il, une chienne qui jamais ne manquait d'aller,
tous les jours, à la découverte conduisant ses petits avec elle; et si
quelqu'un d'eux faisait le rétif, elle le mordait pour le faire marcher
# Il commande
donc à sa petite troupe de forcer les Iroquois et d'arriver à la maison
coûte que coûte
# Le feu continue
avec la plus grande vigueur, tant qu'on a des munitions; mais bientôt
elles viennent à manquer car on ne s'était pas approvisionné pour
soutenir un siège
# Le but principal
de son voyage était de demander à M
# Avant de partir, il nomma pour exercer le
commandement pendant son absence, le brave major Closse Il avait su
assez l'apprécier pour juger qu'il était tout à fait propre à le
remplacer, tant à cause de son expérience dans le métier des armes que
par le grand ascendant que ses vertus et sa bravoure lui avaient acquis
sur les soldats et sur les colons
# Lambert Closse exerça ce commandement
pendant toute l'année à la satisfaction générale; il montra clairement à
tous qu'il savait et qu'il méritait de commander
# En 1657, Lambert Closse épousa Mlle Elizabeth Moyen, fille adoptive de
Mlle Mance, dont les parents avaient été cruellement mis à mort par les
Iroquois le jour de la fête du Saint-Sacrement de l'année 1655
# Mlle Mance les reçut à l'Hôtel-Dieu
et témoigna à ces orphelines l'affection et la sollicitude d'une mère
# Il se trouvait avec lui un Flamand qui lui servait de
domestique
# "Si le Flamand, dit M
# le major serait
peut-être aujourd'hui encore en vie, car ce Pigeon fit merveille et
s'exposa si avant que s'il n'eût eu de bonnes ailes pour s'en revenir,
il eût été perdu lui-même et ne fut jamais revenu à la charge." La fuite
du Flamand donna du courage aux Iroquois pour attaquer Lambert Closse,
qui se trouvait ainsi moins entouré
# Sa
mère adoptive, Mlle Mance qui l'aimait comme si elle eut été sa propre
fille, s'engagea à payer annuellement aux créanciers les sommes qui leur
étaient dues, et Mme Closse détacha pour la même fin dix arpents de son
fief
