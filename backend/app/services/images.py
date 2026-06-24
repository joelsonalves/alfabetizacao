import locale

import httpx


try:
    locale.setlocale(locale.LC_COLLATE, 'pt_BR.UTF-8')
    _SORT_KEY = lambda item: locale.strxfrm(item[1])
except locale.Error:
    _SORT_KEY = lambda item: item[1].lower()


EMOJI_MAP = {
    "A": "🐝", "B": "🏀", "C": "🐶", "D": "🎲", "E": "⭐",
    "F": "🔥", "G": "🐱", "H": "🏥", "I": "🦎", "J": "🐊",
    "K": "🥝", "L": "🍋", "M": "🍎", "N": "🎵", "O": "👁️",
    "P": "🐧", "Q": "🧀", "R": "🐀", "S": "☀️", "T": "🐢",
    "U": "🦄", "V": "🐄", "W": "🌐", "X": "☕", "Y": "🪀", "Z": "🦓",
}

WORD_IMAGE_QUERIES = {
    "casa": "house", "bola": "ball", "gato": "cat", "dado": "dice",
    "foca": "seal", "bala": "candy", "bebe": "baby", "bicho": "bug",
    "burro": "donkey", "braco": "arm", "creme": "cream", "gato bebe": "cat drinking",
    "o gato bebe": "cat drinking milk",
}

SYLLABLE_EMOJI_MAP = {
    # B
    "BA": "🍬", "BE": "👶", "BI": "🚲", "BO": "⚽", "BU": "🐃",
    # C
    "CA": "🏠", "CE": "🌤️", "CI": "🎬", "CO": "🐍", "CU": "🧊",
    # D
    "DA": "🎲", "DE": "🦷", "DI": "💰", "DO": "🍩", "DU": "🚿",
    # F
    "FA": "🔪", "FE": "🌾", "FI": "🎀", "FO": "🦭", "FU": "💨",
    # G
    "GA": "🐱", "GE": "🧊", "GI": "🦒", "GO": "🐬", "GU": "☂️",
    # H
    "HA": "🍔", "HE": "🚁", "HI": "🦛", "HO": "👨",
    # J
    "JA": "🪟", "JO": "📰", "JU": "🥋",
    # L
    "LA": "🍊", "LE": "🦁", "LI": "📖", "LO": "🐺", "LU": "💡",
    # M
    "MA": "🤚", "ME": "🍉", "MI": "🌽", "MO": "🏍️", "MU": "🎵",
    # N
    "NA": "🚢", "NE": "❄️", "NI": "🪺", "NO": "🌙", "NU": "☁️",
    # P
    "PA": "🦆", "PE": "🐟", "PI": "🍦", "PO": "🚪", "PU": "🦘",
    # Q
    "QU": "🧀",
    # R
    "RA": "🐭", "RE": "⌚", "RI": "🌊", "RO": "🌹", "RU": "🏙️",
    # S
    "SA": "🐸", "SE": "📮", "SI": "🔔", "SO": "☀️", "SU": "😱",
    # T
    "TA": "🚕", "TE": "📺", "TI": "🐯", "TO": "🍅", "TU": "🦈",
    # V
    "VA": "🐄", "VE": "🕯️", "VI": "🎸", "VO": "👵",
    # Z
    "ZA": "🥁", "ZE": "🦓",
    # complex syllables
    "BRA": "💪", "CRE": "🧴", "CRU": "✝️",
    "DRA": "🐉",
    "FRA": "🍗", "FRI": "🥶", "FRU": "🍎",
    "GRA": "🌿",
    "PRA": "🍽️", "PRE": "🎁", "PRI": "🤴",
    "TRA": "🚜", "TRE": "🚂", "TRI": "🛺",
    "BLO": "🧱",
    "CLA": "🎼", "CLI": "🌡️",
    "FLA": "🪈", "FLO": "🌸",
    "GLO": "🌍",
    "PLA": "🌱", "PLU": "🪶",
    # CVC
    "AR": "🎯", "ER": "🌿", "IR": "🌈", "OR": "🏅", "UR": "🐻",
    "AL": "🧄", "EL": "🐘", "IL": "🏝️", "OL": "👁️",
    "AN": "💍", "EN": "✉️", "IN": "🐛", "ON": "🐆", "UN": "🦄",
}

WORD_EMOJI_MAP = {
    # words
    "casa": "🏠", "bola": "⚽", "gato": "🐱", "dado": "🎲",
    "foca": "🦭", "bala": "🍬", "sol": "☀️", "mar": "🌊",
    "rato": "🐭", "sapo": "🐸", "pato": "🦆",
    "brasil": "🇧🇷", "prato": "🍽️", "flor": "🌸", "trator": "🚜",
    "cachorro": "🐕", "elefante": "🐘", "abacaxi": "🍍",
    "borboleta": "🦋", "girassol": "🌻", "chocolate": "🍫",
    "janela": "🪟", "cavalo": "🐴", "pássaro": "🐦",
    # extra image query words
    "bebe": "👶", "bicho": "🐛", "burro": "🐴", "braco": "💪", "creme": "🧴",
    # phrases
    "o gato bebe": "🐱", "a bola rola": "⚽", "o sol brilha": "☀️",
    "a casa é grande": "🏠", "o rato comeu o queijo": "🐭",
    "a flor é linda": "🌸", "meu gato é preto": "🐱", "a borboleta voou": "🦋",
    # sentences
    "o gato bebeu leite": "🐱", "a casa tem uma porta vermelha": "🏠",
    "o menino joga a bola no quintal": "⚽",
    "as flores do jardim são coloridas": "🌸",
    "o cachorro corre atrás do gato": "🐕",
    "a borboleta pousou na flor amarela": "🦋",
    "o sol se pôs e a lua brilhou": "🌅",
    "pedro e maria foram à escola juntos": "🏫",
}


EMOJI_CATALOG = {
    "animals": {
        "name": "Animais",
        "icon": "🐶",
        "items": [
            ("🐶", "Cachorro"), ("🐱", "Gato"), ("🐭", "Rato"), ("🐹", "Hamster"),
            ("🐰", "Coelho"), ("🦊", "Raposa"), ("🐻", "Urso"), ("🐼", "Panda"),
            ("🐨", "Coala"), ("🐯", "Tigre"), ("🦁", "Leão"), ("🐮", "Vaca"),
            ("🐷", "Porco"), ("🐸", "Sapo"), ("🐵", "Macaco"), ("🐔", "Galinha"),
            ("🐧", "Pinguim"), ("🐦", "Pássaro"), ("🦆", "Pato"), ("🦅", "Águia"),
            ("🦉", "Coruja"), ("🦇", "Morcego"), ("🐺", "Lobo"), ("🐗", "Javali"),
            ("🐴", "Cavalo"), ("🦄", "Unicórnio"), ("🐝", "Abelha"), ("🐛", "Lagarta"),
            ("🦋", "Borboleta"), ("🐌", "Caracol"), ("🐞", "Joaninha"), ("🐜", "Formiga"),
            ("🦟", "Mosquito"), ("🦗", "Grilo"), ("🐢", "Tartaruga"), ("🐍", "Cobra"),
            ("🦎", "Lagarto"), ("🦖", "Tiranossauro"), ("🦕", "Dinossauro"), ("🐙", "Polvo"),
            ("🦑", "Lula"), ("🦐", "Camarão"), ("🦀", "Caranguejo"), ("🐡", "Baiacu"),
            ("🐠", "Peixe tropical"), ("🐟", "Peixe"), ("🐬", "Golfinho"), ("🐳", "Baleia"),
            ("🦈", "Tubarão"), ("🐊", "Jacaré"), ("🐘", "Elefante"), ("🦒", "Girafa"),
            ("🦘", "Canguru"), ("🦡", "Texugo"), ("🦨", "Gambá"), ("🦦", "Lontra"),
            ("🦥", "Bicho-preguiça"), ("🦌", "Cervo"), ("🐕", "Cachorro grande"),
            ("🐩", "Poodle"), ("🦮", "Cão-guia"),
            ("🦍", "Gorila"), ("🦧", "Orangotango"), ("🐒", "Macaco"),
            ("🐂", "Boi"), ("🐃", "Búfalo"), ("🐏", "Carneiro"), ("🐑", "Ovelha"),
            ("🐐", "Cabra"), ("🦙", "Lhama"), ("🦬", "Bisão"), ("🦣", "Mamute"),
            ("🦫", "Castor"), ("🐿️", "Esquilo"), ("🦔", "Ouriço"), ("🦝", "Guaxinim"),
            ("🐁", "Camundongo"), ("🐇", "Coelho"),
            ("🦩", "Flamingo"), ("🦚", "Pavão"), ("🦜", "Papagaio"),
            ("🐓", "Galo"), ("🐣", "Pintinho"), ("🐤", "Pintinho"), ("🐥", "Pintinho"),
            ("🦢", "Cisne"), ("🦃", "Peru"), ("🪿", "Ganso"), ("🐦‍⬛", "Pássaro preto"),
            ("🐋", "Baleia jubarte"), ("🦭", "Foca"), ("🪸", "Coral"), ("🦞", "Lagosta"),
            ("🦂", "Escorpião"), ("🪰", "Mosca"), ("🪱", "Minhoca"), ("🦠", "Micróbio"),
            ("🪳", "Barata"), ("🪲", "Besouro"),
            ("🐉", "Dragão"), ("🐲", "Dragão chinês"), ("🐦‍🔥", "Fênix"),
            ("🐆", "Onça"), ("🦩", "Flamingo"),
            ("🦓", "Zebra"), ("🦛", "Hipopótamo"), ("🦏", "Rinoceronte"),
            ("🐫", "Camelo"), ("🐪", "Camelo"),
            ("🕷️", "Aranha"), ("🕸️", "Teia de aranha"),
            ("🐾", "Pegadas"), ("🦴", "Osso"),
            ("🐈‍⬛", "Gato preto"), ("🐈", "Gato"),
            ("🐕", "Cachorro andando"), ("🐖", "Leitão"),
            ("🕊️", "Pomba"), ("🦤", "Dodo"), ("🐅", "Tigre"),
        ],
    },
    "food": {
        "name": "Comida",
        "icon": "🍎",
        "items": [
            ("🍎", "Maçã"), ("🍐", "Pera"), ("🍊", "Laranja"), ("🍋", "Limão"),
            ("🍌", "Banana"), ("🍉", "Melancia"), ("🍇", "Uva"), ("🍓", "Morango"),
            ("🍈", "Melão"), ("🍒", "Cereja"), ("🍑", "Pêssego"), ("🥭", "Manga"),
            ("🍍", "Abacaxi"), ("🥥", "Coco"), ("🥝", "Kiwi"), ("🍅", "Tomate"),
            ("🍆", "Berinjela"), ("🥑", "Abacate"), ("🥦", "Brócolis"), ("🥬", "Alface"),
            ("🥒", "Pepino"), ("🌶️", "Pimenta"), ("🌽", "Milho"), ("🥕", "Cenoura"),
            ("🧄", "Alho"), ("🧅", "Cebola"), ("🥔", "Batata"), ("🍠", "Batata-doce"),
            ("🥐", "Croissant"), ("🍞", "Pão"), ("🥖", "Baguete"), ("🥨", "Pretzel"),
            ("🧀", "Queijo"), ("🥚", "Ovo"), ("🍳", "Frigideira"), ("🧈", "Manteiga"),
            ("🥞", "Panqueca"), ("🧇", "Waffle"), ("🥓", "Bacon"), ("🥩", "Carne"),
            ("🍗", "Coxa de frango"), ("🍗", "Frango"), ("🍖", "Osso"), ("🌭", "Cachorro-quente"),
            ("🍔", "Hambúrguer"), ("🍟", "Batata frita"), ("🍕", "Pizza"),
            ("🥪", "Sanduíche"), ("🥙", "Kebab"), ("🧆", "Falafel"), ("🥗", "Salada"),
            ("🥘", "Panela"), ("🥫", "Enlatado"), ("🍝", "Macarrão"), ("🍜", "Lámen"),
            ("🍲", "Sopa"), ("🍛", "Curry"), ("🍣", "Sushi"), ("🥟", "Pastel"),
            ("🍦", "Sorvete"), ("🍧", "Raspadinha"), ("🍨", "Sorvete de copo"),
            ("🍩", "Donut"), ("🍪", "Biscoito"), ("🎂", "Bolo"), ("🧁", "Cupcake"),
            ("🥧", "Torta"), ("🍫", "Chocolate"), ("🍬", "Bala"), ("🍭", "Pirulito"),
            ("🍮", "Pudim"), ("🍯", "Mel"),             ("🥛", "Leite"), ("☕", "Café"), ("☕", "Xícara"),
            ("🍵", "Chá"), ("🧋", "Bubble tea"), ("🍺", "Cerveja"),
            ("🍻", "Caneca de cerveja"), ("🥂", "Brinde"), ("🍷", "Vinho"),
            ("🥃", "Whisky"), ("🍸", "Coquetel"), ("🍹", "Drink tropical"),
            ("🧉", "Chimarrão"), ("🍼", "Mamadeira"), ("🥤", "Copo com canudo"),
            ("🧃", "Suco de caixinha"),
            ("🌮", "Taco"), ("🌯", "Burrito"), ("🍱", "Bento"),
            ("🍙", "Onigiri"), ("🍘", "Bolinho de arroz"), ("🥮", "Bolo lunar"),
            ("🫔", "Tamale"), ("🥣", "Tigela"), ("🥠", "Biscoito da sorte"),
            ("🥡", "Caixa de comida chinesa"),
            ("🫘", "Feijão"), ("🫒", "Azeitona"), ("🫑", "Pimentão"),
            ("🫐", "Mirtilo"), ("🫓", "Pão sírio"),
            ("🍡", "Dango"), ("🍥", "Naruto"), ("🍢", "Bolinho de peixe"),
            ("🧊", "Gelo"), ("🧂", "Sal"), ("🍿", "Pipoca"),
            ("🥜", "Amendoim"), ("🍰", "Bolo de fatia"),
            ("🫘", "Feijão"),
            # Mais alimentos
            ("🍿", "Pipoca"), ("🥫", "Enlatado"),
            ("🫕", "Fondue"), ("🥣", "Tigela"),
            ("🫙", "Pote"), ("🥄", "Colher"),
            ("🍴", "Garfo e faca"),
            ("🥤", "Copo"), ("🧃", "Suco"),
            ("🧊", "Gelo cúbico"), ("🧁", "Cupcake"),
            ("🍩", "Donut"), ("🍪", "Biscoito"),
            ("🧇", "Waffle"), ("🥞", "Panqueca"),
            ("🥚", "Ovo"), ("🧀", "Queijo"),
            ("🧈", "Manteiga"), ("🧂", "Sal"),
            ("🫘", "Feijão"), ("🫒", "Azeitona"),
            ("🫑", "Pimentão"), ("🫐", "Mirtilo"),
            ("🥟", "Pastel"), ("🍲", "Sopa"),
            ("🥮", "Bolo lunar"), ("🍘", "Bolinho arroz"),
            ("🧁", "Cupcake"), ("🍰", "Bolo fatia"),
        ],
    },
    "nature": {
        "name": "Natureza",
        "icon": "🌞",
        "items": [
            ("☀️", "Sol"), ("🌞", "Sol sorrindo"), ("🌝", "Lua cheia"), ("🌛", "Lua crescente"),
            ("🌚", "Lua nova"), ("⭐", "Estrela"), ("🌟", "Estrela brilhante"), ("✨", "Brilho"),
            ("⚡", "Raio"), ("🔥", "Fogo"), ("💧", "Gota"), ("🌊", "Onda"),
            ("🌈", "Arco-íris"), ("☁️", "Nuvem"), ("🌤️", "Sol com nuvem"), ("🌧️", "Chuva"),
            ("⛈️", "Tempestade"), ("🌩️", "Relâmpago"), ("🌪️", "Tornado"), ("🌫️", "Nevoeiro"),
            ("❄️", "Neve"), ("🌨️", "Neve"), ("🌬️", "Vento"), ("💨", "Fumaça"),
            ("🌱", "Broto"), ("🌿", "Grama"), ("☘️", "Trevo"), ("🍀", "Trevo de quatro folhas"),
            ("🍁", "Folha de bordo"), ("🍂", "Folha seca"), ("🍃", "Folha ao vento"),
            ("🌲", "Pinheiro"), ("🌳", "Árvore"), ("🌴", "Palmeira"), ("🌵", "Cacto"),
            ("🌸", "Flor de cerejeira"), ("🌹", "Rosa"), ("🌻", "Girassol"), ("🌺", "Hibisco"),
            ("🌷", "Tulipa"), ("🌾", "Arrozal"), ("🌍", "Terra"), ("🌎", "Terra América"),
            ("🌏", "Terra Ásia"), ("🌕", "Lua cheia"), ("💫", "Cometa"), ("🪐", "Saturno"),
            ("💥", "Explosão"), ("☄️", "Meteoro"), ("⛰️", "Montanha"), ("🌋", "Vulcão"),
            ("🏝️", "Ilha"), ("🏖️", "Praia"), ("🏜️", "Deserto"),
            ("🌅", "Nascer do sol"), ("🌄", "Amanhecer"), ("🌇", "Pôr do sol"),
            ("🌌", "Via Láctea"), ("🌠", "Estrela cadente"), ("🌑", "Lua nova"),
            ("🏞️", "Parque nacional"), ("🏔️", "Montanha nevada"), ("🏙️", "Paisagem urbana"),
            ("🪨", "Pedra"), ("🌰", "Castanha"), ("🧊", "Gelo"),
            ("🐚", "Concha"), ("🌡️", "Termômetro"), ("🧭", "Bússola"),
            ("🪴", "Vaso de planta"),
            ("🌼", "Flor"), ("🪷", "Lótus"), ("🍄", "Cogumelo"),
            ("🪵", "Tronco"), ("🥀", "Flor murcha"),
            ("🌦️", "Sol com chuva"),
            ("🌥️", "Nuvem espessa"), ("🌁", "Nevoeiro"),
            ("🌗", "Quarto crescente"), ("🌖", "Quarto minguante"),
            ("🌘", "Lua minguante"), ("🌒", "Lua crescente"),
            ("💦", "Suor"), ("🫧", "Bolhas"),
            ("🌬️", "Vento"), ("💨", "Fumaça"),
            ("🌀", "Ciclone"), ("🌈", "Arco-íris"),
            ("🌂", "Guarda-chuva"), ("☂️", "Guarda-chuva"),
            ("☔", "Guarda-chuva com chuva"),
            ("🔥", "Fogo"), ("💥", "Explosão"),
            ("🌟", "Estrela brilhante"),
            ("✨", "Brilho"),
            ("🌪️", "Tornado"), ("🌫️", "Nevoeiro"),
            ("🏝️", "Ilha"), ("🏖️", "Praia"),
            ("🏜️", "Deserto"), ("🏔️", "Montanha nevada"),
            ("🌲", "Pinheiro"), ("🌳", "Árvore"),
            ("🍃", "Folha"), ("🍂", "Folha seca"),
            ("🌙", "Lua"), ("🥶", "Frio"),
        ],
    },
    "objects": {
        "name": "Objetos",
        "icon": "🏠",
        "items": [
            ("🏠", "Casa"), ("🏡", "Casa com jardim"), ("🏢", "Prédio"), ("🏫", "Escola"),
            ("🏪", "Loja"), ("🏥", "Hospital"), ("🏦", "Banco"), ("⛪", "Igreja"),
            ("📚", "Livros"), ("📖", "Livro aberto"), ("📕", "Livro fechado"),
            ("✏️", "Lápis"), ("🖊️", "Caneta"), ("🖍️", "Giz de cera"), ("📏", "Régua"),
            ("✂️", "Tesoura"), ("📎", "Clipe"), ("📌", "Tachinha"), ("📍", "Alfinete"),
            ("🗑️", "Lixeira"), ("🖥️", "Computador"), ("💻", "Notebook"), ("📱", "Celular"),
            ("⌚", "Relógio"), ("📷", "Câmera"), ("🎥", "Filmadora"), ("📺", "Televisão"),
            ("🔦", "Lanterna"),             ("💡", "Luz"), ("🔑", "Chave"), ("🔨", "Martelo"),
            ("🪛", "Chave de fenda"), ("🔧", "Chave inglesa"), ("⚙️", "Engrenagem"),
            ("🔩", "Porca e parafuso"), ("🧰", "Caixa de ferramentas"), ("🪜", "Escada"),
            ("🔪", "Faca"), ("🛡️", "Escudo"), ("🗿", "Estátua"), ("🧸", "Urso de pelúcia"),
            ("🎮", "Videogame"), ("🃏", "Carta de baralho"), ("🎲", "Dado"),
            ("🧩", "Peça de quebra-cabeça"), ("🎨", "Paleta de tintas"), ("🎪", "Circo"),
            ("🎭", "Teatro"), ("🎵", "Nota musical"), ("🎶", "Notas musicais"),
            ("🎸", "Violão"), ("🎺", "Trompete"), ("🎻", "Violino"), ("🥁", "Tambor"),
            ("🎹", "Teclado musical"), ("🎠", "Cavalo de carrossel"),
            ("🏀", "Basquete"), ("🌐", "Globo"), ("🪀", "Ioiô"),
            ("🧴", "Frasco"), ("🧽", "Esponja"), ("🧹", "Vassoura"),
            ("🧺", "Cesto"), ("🧮", "Ábaco"), ("🪥", "Escova de dentes"),
            ("🪒", "Barbeador"), ("🧲", "Ímã"), ("🧯", "Extintor"),
            ("🪣", "Balde"), ("🧻", "Rolo de papel"), ("🪞", "Espelho"),
            ("👕", "Camiseta"), ("👖", "Calça"), ("👗", "Vestido"),
            ("👘", "Quimono"), ("👙", "Biquíni"), ("🩱", "Maiô"),
            ("🩲", "Cueca"), ("🩳", "Shorts"), ("👔", "Gravata"),
            ("👚", "Blusa"), ("🥻", "Sári"), ("🩴", "Chinelo"),
            ("👞", "Sapato"), ("👟", "Tênis"), ("👠", "Salto alto"),
            ("👡", "Sandália"), ("👢", "Bota"), ("🥾", "Bota de neve"),
            ("🥿", "Sapatilha"),
            ("👒", "Chapéu"), ("🎩", "Cartola"), ("🎓", "Capelo"),
            ("🧢", "Boné"), ("⛑️", "Capacetinho"), ("🪖", "Capacete"),
            ("🧣", "Cachecol"), ("🧤", "Luvas"), ("🧦", "Meias"),
            ("👛", "Bolsa"), ("👜", "Bolsa"), ("👝", "Pochetinha"),
            ("🎒", "Mochila"), ("🧳", "Mala"),
            ("🛋️", "Sofá"), ("🛏️", "Cama"), ("🪑", "Cadeira"),
            ("🪟", "Janela"), ("🚪", "Porta"),
            ("🖨️", "Impressora"), ("🖱️", "Mouse"), ("⌨️", "Teclado"),
            ("💾", "Disquete"), ("💿", "CD"), ("📀", "DVD"),
            ("📟", "Pager"), ("📠", "Fax"), ("☎️", "Telefone"),
            ("📃", "Documento"), ("📄", "Página"), ("📑", "Marcadores"),
            ("🧾", "Recibo"), ("🔋", "Bateria"), ("🔌", "Tomada"),
            ("🖲️", "Trackball"),
            ("🪚", "Serrote"), ("⛏️", "Picareta"), ("⚒️", "Martelo e picareta"),
            ("🛠️", "Chaves e martelo"), ("🔗", "Elos"), ("⛓️", "Corrente"),
            ("💊", "Comprimido"), ("💉", "Seringa"), ("🩹", "Band-aid"),
            ("🩺", "Estetoscópio"), ("🩻", "Raio-X"), ("🩸", "Sangue"),
            ("🩼", "Muleta"),
            ("♟️", "Xadrez"), ("🎰", "Caça-níquel"), ("🎳", "Boliche"),
            ("🪘", "Tambor"), ("🪕", "Banjo"), ("🎙️", "Microfone"),
            ("🎚️", "Mixer"), ("🎛️", "Botões"),
            ("🔊", "Alto-falante"), ("🔈", "Speaker"), ("🔇", "Mudo"),
            ("📻", "Rádio"), ("📯", "Corneta"),
            ("🧬", "DNA"), ("🧫", "Placa de Petri"), ("🧪", "Tubo de ensaio"),
            ("🔭", "Telescópio"), ("🔬", "Microscópio"), ("⚗️", "Alambique"),
            ("⛸️", "Patins no gelo"), ("🎗️", "Fita de lembrança"),
            ("🎟️", "Ingressos"), ("🎫", "Bilhete"),
            ("🗝️", "Chave"), ("🪃", "Bumerangue"), ("🪢", "Nó"),
            # Utensílios domésticos e cozinha
            ("🍽️", "Prato"), ("🥄", "Colher"), ("🍴", "Garfo"),
            ("🥢", "Hashi"), ("🔪", "Faca de cozinha"),
            ("🧂", "Saleiro"), ("⚱️", "Urna"), ("🕯️", "Vela"),
            ("🪠", "Desentupidor"), ("🧶", "Novelo"), ("🧵", "Linha"),
            ("🪡", "Agulha"), ("🪢", "Nó"),
            # Material escolar e papelaria
            ("📐", "Esquadro"), ("📒", "Caderno"), ("📓", "Caderno"),
            ("📔", "Caderno decorado"), ("📗", "Livro verde"),
            ("📘", "Livro azul"), ("📙", "Livro laranja"),
            ("📚", "Livros"), ("📇", "Fichário"),
            ("📋", "Prancheta"), ("📁", "Pasta"), ("📂", "Pasta aberta"),
            ("🖇️", "Clipes"), ("✉️", "Envelope"),
            ("📧", "E-mail"), ("📨", "Envelope chegando"),
            ("📩", "Envelope com seta"), ("📪", "Caixa fechada"),
            ("📫", "Caixa aberta"), ("📬", "Caixa aberta"),
            ("📭", "Caixa sem correspondência"),
            ("📮", "Caixa de correio"),
            # Higiene e cuidados
            ("💄", "Batom"), ("💋", "Marca de batom"),
            ("💎", "Diamante"), ("🪥", "Escova de dentes"),
            ("🪒", "Barbeador"), ("🧴", "Frasco"),
            # Casa e construção
            ("🏗️", "Construção"), ("🏘️", "Casas"),
            ("🏚️", "Casa abandonada"), ("🏛️", "Museu"),
            ("⛺", "Barraca"), ("🏕️", "Acampamento"),
            # Animais de estimação e objetos
            ("🪹", "Ninho"), ("🪺", "Ninho com ovos"),
            # Vestuário adicional
            ("🥻", "Sári"), ("🩴", "Chinelo"),
            ("🧥", "Casaco"), ("🦺", "Colete"),
            ("🧶", "Novelo"),
            # Mais itens diversos
            ("🧿", "Olho grego"), ("🪄", "Varinha"),
            ("🎁", "Presente"), ("🎀", "Fita"),
            ("🏆", "Troféu"), ("🥇", "Medalha ouro"),
            ("🥈", "Medalha prata"), ("🥉", "Medalha bronze"),
            ("⚽", "Bola de futebol"), ("🏀", "Bola de basquete"),
            ("⚾", "Bola de beisebol"), ("🎾", "Bola de tênis"),
            ("🏐", "Vôlei"), ("🏉", "Rúgbi"),
            ("🎱", "Bola de sinuca"),
            ("🔫", "Pistola d'água"),
            ("🪁", "Pipa"), ("🪀", "Ioiô"),
            # Mais objetos
            ("🕰️", "Relógio antigo"), ("🗡️", "Adaga"),
            ("🛎️", "Campainha"), ("🧧", "Envelope vermelho"),
            ("🎐", "Móbile"), ("🎊", "Confete"),
            ("🎉", "Festa"), ("🎃", "Abóbora"),
            ("🎄", "Árvore Natal"), ("🎆", "Fogos"),
            ("🎇", "Fogos de artifício"),
            ("🧨", "Foguetinho"), ("🎈", "Balão"),
            ("🎁", "Presente"), ("🎀", "Fita"),
            ("🎬", "Claquete"), ("💰", "Dinheiro"), ("🚿", "Chuveiro"),
            ("📰", "Jornal"), ("🥋", "Judô"), ("🔔", "Sino"),
            ("💍", "Anel"), ("🏅", "Medalha"), ("🧱", "Bloco"),
            ("🎼", "Clave musical"), ("🌡️", "Termômetro"), ("🪈", "Flauta"),
            ("🪶", "Pluma"), ("✝️", "Cruz"),
        ],
    },
    "people": {
        "name": "Pessoas",
        "icon": "👶",
        "items": [
            ("👶", "Bebê"), ("🧒", "Criança"), ("👦", "Menino"), ("👧", "Menina"),
            ("🧑", "Pessoa"), ("👩", "Mulher"), ("👨", "Homem"),
            ("👩‍🦱", "Mulher cabelo cacheado"), ("👨‍🦱", "Homem cabelo cacheado"),
            ("👩‍🦰", "Mulher ruiva"), ("👨‍🦰", "Homem ruivo"),
            ("👩‍🦳", "Mulher cabelo branco"), ("👨‍🦳", "Homem cabelo branco"),
            ("👩‍🦲", "Mulher careca"), ("👨‍🦲", "Homem careca"),
            ("🧔‍♀️", "Mulher barbuda"), ("🧔‍♂️", "Homem barbudo"),
            ("👴", "Idoso"), ("👵", "Vovó"), ("🙋", "Pessoa acenando"),
            ("💁", "Pessoa informando"), ("🙆", "Pessoa OK"), ("🙅", "Pessoa proibindo"),
            ("🤦‍♂️", "Homem cara-palma"), ("🤦‍♀️", "Mulher cara-palma"),
            ("💃", "Mulher dançando"), ("🕺", "Homem dançando"),
            ("👫", "Casal de mãos dadas"), ("👪", "Família"),
            ("👤", "Silhueta"), ("👥", "Silhuetas"),
            ("👩‍🍳", "Cozinheira"), ("👨‍🍳", "Cozinheiro"),
            ("👩‍🏫", "Professora"), ("👨‍🏫", "Professor"),
            ("👩‍⚕️", "Médica"), ("👨‍⚕️", "Médico"),
            ("👩‍🎓", "Formanda"), ("👨‍🎓", "Formando"),
            ("👩‍🎤", "Cantora"), ("👨‍🎤", "Cantor"),
            ("👩‍🚒", "Bombeira"), ("👨‍🚒", "Bombeiro"),
            ("👩‍🚀", "Astronauta"), ("👨‍🚀", "Astronauta"),
            ("👩‍✈️", "Piloto"), ("👨‍✈️", "Piloto"),
            ("👩‍🔧", "Mecânica"), ("👨‍🔧", "Mecânico"),
            ("👩‍🌾", "Agricultora"), ("👨‍🌾", "Agricultor"),
            ("👩‍🎨", "Artista"), ("👨‍🎨", "Artista"),
            ("👩‍🔬", "Cientista"), ("👨‍🔬", "Cientista"),
            ("👩‍💻", "Desenvolvedora"), ("👨‍💻", "Desenvolvedor"),
            ("👩‍💼", "Executiva"), ("👨‍💼", "Executivo"),
            ("👩‍🏭", "Trabalhadora"), ("👨‍🏭", "Trabalhador"),
            ("👸", "Princesa"), ("🤴", "Príncipe"),
            ("🧙‍♀️", "Bruxa"), ("🧙‍♂️", "Bruxo"),
            ("🧚‍♀️", "Fada"), ("🧚‍♂️", "Duende"),
            ("🧛‍♀️", "Vampira"), ("🧛‍♂️", "Vampiro"),
            ("🧜‍♀️", "Sereia"), ("🧜‍♂️", "Tritão"),
            ("🧝‍♀️", "Elfa"), ("🧝‍♂️", "Elfo"),
            ("🦸‍♀️", "Super-heroína"), ("🦸‍♂️", "Super-herói"),
            ("🦹‍♀️", "Vilã"), ("🦹‍♂️", "Vilão"),
            ("👮‍♀️", "Policial"), ("👮‍♂️", "Policial"),
            ("🕵️‍♀️", "Detetive"), ("🕵️‍♂️", "Detetive"),
            ("💂‍♀️", "Guarda"), ("💂‍♂️", "Guarda"),
            ("🤱", "Mãe amamentando"),
            ("👳‍♀️", "Pessoa de turbante"), ("👳‍♂️", "Pessoa de turbante"),
            ("🧕", "Mulher de hijab"),
            ("🤶", "Mãe Natal"), ("🎅", "Papai Noel"),
            ("🧑‍🎄", "Elfo de Natal"),
            ("👲", "Pessoa de chapéu chinês"),
            # Gestos
            ("🙋‍♂️", "Homem acenando"), ("🙋‍♀️", "Mulher acenando"),
            ("🤷‍♂️", "Homem dúvida"), ("🤷‍♀️", "Mulher dúvida"),
            ("🙇‍♂️", "Homem curvando"), ("🙇‍♀️", "Mulher curvando"),
            ("🤰", "Grávida"), ("🤱", "Mãe amamentando"),
            # Famílias
            ("👨‍👩‍👧‍👦", "Família homem-mulher"), ("👩‍👩‍👧‍👦", "Família duas mulheres"),
            ("👨‍👨‍👧‍👦", "Família dois homens"),
            ("👩‍❤️‍👨", "Casal apaixonado"),
            # Crianças e adolescentes
            ("🧑‍🤝‍🧑", "Pessoas de mãos dadas"),
            ("🧏‍♀️", "Surda"), ("🧏‍♂️", "Surdo"),
            ("🧑‍🦰", "Pessoa ruiva"), ("🧑‍🦱", "Pessoa cacheada"),
            ("🧑‍🦳", "Pessoa cabelo branco"), ("🧑‍🦲", "Pessoa careca"),
            # Mais profissões
            ("🧑‍⚕️", "Profissional de saúde"),
            ("🧑‍🎓", "Estudante"), ("🧑‍🏫", "Professor"),
            ("🧑‍⚖️", "Juiz"), ("👩‍⚖️", "Juíza"), ("👨‍⚖️", "Juiz"),
            ("🧑‍🌾", "Agricultor"), ("🧑‍🍳", "Cozinheiro"),
            ("🧑‍🔧", "Mecânico"), ("🧑‍🏭", "Trabalhador"),
            ("🧑‍💼", "Escriturário"), ("🧑‍🔬", "Cientista"),
            ("🧑‍💻", "Programador"), ("🧑‍🎤", "Cantor"),
            ("🧑‍🎨", "Artista"), ("🧑‍✈️", "Piloto"),
            ("🧑‍🚀", "Astronauta"), ("🧑‍🚒", "Bombeiro"),
            # Atividades e personagens
            ("🏋️‍♀️", "Mulher levantando peso"),
            ("🏋️‍♂️", "Homem levantando peso"),
            ("🤸‍♀️", "Mulher estrela"), ("🤸‍♂️", "Homem estrela"),
            ("🤹‍♀️", "Mulher malabares"), ("🤹‍♂️", "Homem malabares"),
            ("🧘‍♀️", "Mulher meditando"), ("🧘‍♂️", "Homem meditando"),
            ("🧖‍♀️", "Mulher sauna"), ("🧖‍♂️", "Homem sauna"),
            # Mais papéis
            ("🧞‍♀️", "Gênia"), ("🧞‍♂️", "Gênio"),
            ("🧟‍♀️", "Zumbi"), ("🧟‍♂️", "Zumbi"),
            ("🧌", "Troll"),
            # Bebês e crianças
            ("👼", "Anjo"),
            ("🧑‍🎄", "Elfo de Natal"),
            # Pessoas com deficiência
            ("🧑‍🦯", "Pessoa com bengala"),
            ("🧑‍🦼", "Pessoa em cadeira motorizada"),
            ("🧑‍🦽", "Pessoa em cadeira manual"),
            ("🧎‍♀️", "Mulher ajoelhada"), ("🧎‍♂️", "Homem ajoelhado"),
            ("🧑‍🦰", "Pessoa ruiva"),
            # Mais variações
            ("🧑‍🦱", "Pessoa cabelo cacheado"),
            # Mais pessoas
            ("👩‍🦰", "Mulher ruiva"), ("👨‍🦰", "Homem ruivo"),
            ("👩‍🦳", "Mulher cabelo branco"), ("👨‍🦳", "Homem cabelo branco"),
            ("👩‍🦲", "Mulher careca"), ("👨‍🦲", "Homem careca"),
            ("🙋‍♂️", "Homem acenando"), ("🙋‍♀️", "Mulher acenando"),
            ("🤷‍♂️", "Homem dúvida"), ("🤷‍♀️", "Mulher dúvida"),
            ("🙇‍♂️", "Homem curvando"), ("🙇‍♀️", "Mulher curvando"),
            ("🤱", "Mãe amamentando"), ("🤰", "Grávida"),
            # Mais pessoas
            ("🧑‍🤝‍🧑", "Mãos dadas"), ("🙋", "Pessoa acenando"),
            ("🤦", "Cara-palma"), ("🙅", "Pessoa proibindo"),
            ("🙆", "Pessoa OK"), ("💁", "Pessoa informando"),
            ("💆", "Massagem"), ("💇", "Corte de cabelo"),
            ("🚶", "Andando"), ("🏃", "Correndo"),
            ("🧎", "Ajoelhado"), ("🧍", "Em pé"),
            ("💆‍♀️", "Massagem feminina"), ("💆‍♂️", "Massagem masculina"),
            ("💇‍♀️", "Corte feminino"), ("💇‍♂️", "Corte masculino"),
            ("🚶‍♀️", "Mulher andando"), ("🚶‍♂️", "Homem andando"),
            ("🏃‍♀️", "Mulher correndo"), ("🏃‍♂️", "Homem correndo"),
            ("🧍‍♀️", "Mulher em pé"), ("🧍‍♂️", "Homem em pé"),
            ("🧎‍♀️", "Mulher ajoelhada"), ("🧎‍♂️", "Homem ajoelhado"),
            # Mais pessoas
            ("🧔", "Pessoa barbuda"), ("🧓", "Idoso"),
            ("👱‍♀️", "Loira"), ("👱‍♂️", "Loiro"),
            ("🧏", "Surdo"), ("🧏‍♀️", "Surda"),
            ("👭", "Mulheres de mãos dadas"),
            ("👬", "Homens de mãos dadas"),
            ("🧑‍🦱", "Pessoa cabelo cacheado"),
            ("🧑‍🦰", "Pessoa ruiva"),
            ("😱", "Susto"),
        ],
    },
    "transport": {
        "name": "Transporte",
        "icon": "🚗",
        "items": [
            ("🚗", "Carro"), ("🚕", "Táxi"), ("🚙", "SUV"), ("🚌", "Ônibus"),
            ("🚎", "Trólebus"), ("🏎️", "Carro de corrida"), ("🚓", "Viatura"),
            ("🚑", "Ambulância"), ("🚒", "Caminhão de bombeiro"), ("🚐", "Kombi"),
            ("🛻", "Picape"), ("🚚", "Caminhão"), ("🚛", "Caminhão grande"), ("🚜", "Trator"),
            ("🏍️", "Moto"), ("🛵", "Lambreta"), ("🛺", "Triciclo"), ("🚲", "Bicicleta"),
            ("🛴", "Patinete"), ("🛹", "Skate"), ("🚨", "Sirene"), ("🚔", "Viatura ligada"),
            ("🚡", "Bonde aéreo"), ("🚟", "Bonde suspenso"), ("🚃", "Vagão"),
            ("🚋", "Bonde"), ("🚞", "Trem de montanha"), ("🚝", "Monotrilho"),
            ("🚄", "Trem-bala"), ("🚅", "Trem-bala frente"), ("🚈", "Trem leve"),
            ("🚂", "Locomotiva"), ("🚆", "Trem"), ("🚇", "Metrô"), ("🚊", "Trem leve"),
            ("🚉", "Estação"), ("✈️", "Avião"), ("🛫", "Avião decolando"),
            ("🛬", "Avião aterrissando"), ("🛩️", "Avião pequeno"), ("💺", "Poltrona"),
            ("🛰️", "Satélite"), ("🚀", "Foguete"), ("🛸", "Disco voador"), ("🚁", "Helicóptero"),
            ("🛶", "Canoa"), ("⛵", "Veleiro"), ("🚤", "Lancha"), ("🛥️", "Barco motorizado"),
            ("🛳️", "Navio de cruzeiro"), ("⛴️", "Balsa"), ("🚢", "Navio"), ("🛟", "Bóia"),
            ("🚥", "Semáforo"), ("🚦", "Semáforo vertical"),
            ("🚏", "Ponto de ônibus"), ("⛽", "Bomba de gasolina"),
            ("🛤️", "Trilhos"), ("🛣️", "Rodovia"), ("🗺️", "Mapa"),
            ("🛞", "Roda"),
            ("🛼", "Patins"), ("🛗", "Elevador"), ("🚰", "Água potável"),
            ("♿", "Acessibilidade"), ("🚹", "Banheiro masculino"),
            ("🚺", "Banheiro feminino"), ("🚻", "Banheiro"),
            ("🚸", "Crianças atravessando"), ("⚠️", "Atenção"),
            ("🚳", "Proibido bicicleta"),
            ("🅿️", "Estacionamento"), ("🚧", "Obras"),
            ("🚮", "Lixeira"), ("🚯", "Proibido lixo"),
            ("🚱", "Água não potável"),
            ("🛑", "Pare"), ("🚸", "Crianças"),
            ("🚫", "Proibido"), ("📯", "Corneta"),
            ("🛞", "Roda"), ("🚅", "Trem-bala"),
            ("🚆", "Trem"), ("🚇", "Metrô"),
            ("🗺️", "Mapa"), ("🧭", "Bússola"),
        ],
    },
    "actions": {
        "name": "Ações",
        "icon": "🏃",
        "items": [
            ("🏃", "Correndo"), ("🚶", "Andando"), ("🧍", "Em pé"), ("🧎", "Ajoelhado"),
            ("🏋️", "Levantando peso"), ("🤸", "Estrela"), ("🤹", "Malabarismo"),
            ("🪂", "Paraquedas"), ("🏊", "Nadando"), ("🤽", "Polo aquático"),
            ("🚣", "Remando"), ("🧗", "Escalando"), ("🚴", "Ciclismo"), ("🤼", "Luta"),
            ("🤺", "Esgrima"), ("⛷️", "Esqui"), ("🏄", "Surfando"), ("🏇", "Hipismo"),
            ("🪁", "Empinando pipa"), ("🛝", "Escorregando"), ("🎢", "Montanha-russa"),
            ("🛌", "Dormindo"), ("🛀", "Tomando banho"), ("🧘", "Meditando"),
            ("🍽️", "Comendo"), ("📖", "Lendo"), ("✍️", "Escrevendo"),
            ("🎤", "Cantando"), ("🎧", "Ouvindo música"), ("📞", "Falando ao telefone"),
            ("👋", "Acenando"), ("🤝", "Apertando mãos"), ("👍", "Joinha"),
            ("👎", "Joinha negativo"), ("👏", "Palmas"), ("🙌", "Comemorando"),
            ("🙏", "Rezando"), ("💪", "Músculo"), ("🦶", "Pé"), ("👂", "Ouvido"),
            ("👃", "Nariz"), ("👁️", "Olho"), ("👄", "Boca"), ("🦷", "Dente"),
            ("👅", "Língua"), ("💋", "Beijo"),
            ("🤳", "Selfie"), ("🧑‍🦯", "Pessoa com bengala"),
            ("🧑‍🦼", "Pessoa em cadeira de rodas"), ("🧑‍🦽", "Pessoa em cadeira manual"),
            ("🥋", "Artes marciais"), ("🥊", "Boxe"), ("🤿", "Mergulho"),
            ("🪄", "Mágica"), ("🎯", "Acertando alvo"),
            ("🧠", "Cérebro"), ("🫀", "Coração"), ("👀", "Olhos"),
            ("🧖", "Sauna"), ("🫂", "Abraço"), ("🤲", "Mãos juntas"), ("🩰", "Balé"),
            # Esportes
            ("🏏", "Críquete"), ("🏑", "Hóquei"), ("🏒", "Hóquei no gelo"),
            ("🥍", "Lacrosse"), ("🏓", "Tênis de mesa"), ("🏸", "Badminton"),
            ("⛳", "Golfe"), ("🥅", "Gol"), ("🎣", "Pesca"),
            ("🎿", "Esqui cross-country"),
            # Partes do corpo
            ("🦵", "Perna"), ("🦿", "Perna mecânica"),
            ("🦾", "Braço mecânico"), ("🦻", "Ouvido com aparelho"),
            ("👁️‍🗨️", "Olho em balão"),
            # Gestos de mão
            ("🤟", "Amo-te"), ("🤙", "Me liga"), ("🤘", "Rock on"),
            ("🤞", "Torcendo"), ("🖖", "Saudação vulcana"),
            ("🤌", "Gestos italianos"), ("🫶", "Coração com mãos"),
            ("🫰", "Mãos com dedos"), ("🫵", "Apontando"),
            ("🫱", "Mão direita"), ("🫲", "Mão esquerda"),
            ("🫳", "Mão palma baixa"), ("🫴", "Mão palma alta"),
            ("👐", "Mãos abertas"), ("🤲", "Mãos juntas"),
            ("🤚", "Mão"), ("🖐️", "Mão aberta"),
            ("✋", "Mão parando"), ("👌", "OK"),
            ("✌️", "Paz e amor"), ("🤏", "Pouquinho"),
            ("🫳", "Mão palma baixa"), ("🫴", "Mão palma alta"),
            ("🤛", "Punho esquerdo"), ("🤜", "Punho direito"),
            # Mais atividades
            ("🧑‍🍳", "Cozinhando"), ("🧑‍🌾", "Cultivando"),
            ("🧑‍🏫", "Ensinando"), ("🧑‍🔬", "Experimentando"),
            ("🧑‍🎨", "Pintando"), ("🧑‍🎤", "Cantando"),
            ("🧑‍💻", "Programando"),
            # Mais esportes e atividades
            ("🏌️", "Golfe"), ("⛹️", "Quicando bola"),
            ("🤾", "Handebol"), ("🏐", "Vôlei"), ("🏈", "Futebol americano"),
            ("🏉", "Rúgbi"), ("🎾", "Tênis"),
            ("🥎", "Softbol"), ("⚾", "Beisebol"),
            ("🏏", "Críquete"), ("🏑", "Hóquei"),
            ("🏒", "Hóquei no gelo"), ("🥍", "Lacrosse"),
            # Gestos e expressões
            ("😀", "Sorrindo"), ("😂", "Rindo"),
            ("😍", "Apaixonado"), ("😎", "Legal"),
            ("😢", "Chorando"), ("😡", "Bravo"),
            ("🤩", "Estrela"), ("🤗", "Abraçando"),
            ("🤔", "Pensando"), ("🤫", "Silêncio"),
        ],
    },
    "shapes": {
        "name": "Formas e Cores",
        "icon": "🔴",
        "items": [
            ("🔴", "Círculo vermelho"), ("🟠", "Círculo laranja"), ("🟡", "Círculo amarelo"),
            ("🟢", "Círculo verde"), ("🔵", "Círculo azul"), ("🟣", "Círculo roxo"),
            ("🟤", "Círculo marrom"), ("⚫", "Círculo preto"), ("⚪", "Círculo branco"),
            ("🟥", "Quadrado vermelho"), ("🟧", "Quadrado laranja"), ("🟨", "Quadrado amarelo"),
            ("🟩", "Quadrado verde"), ("🟦", "Quadrado azul"), ("🟪", "Quadrado roxo"),
            ("⬛", "Quadrado preto"), ("⬜", "Quadrado branco"),
            ("🔶", "Losango laranja"), ("🔷", "Losango azul"),
            ("🔺", "Triângulo vermelho"), ("🔻", "Triângulo invertido"),
            ("♠️", "Espada"), ("♥️", "Coração"), ("♦️", "Ouros"), ("♣️", "Paus"),
            ("❤️", "Coração vermelho"), ("🧡", "Coração laranja"), ("💛", "Coração amarelo"),
            ("💚", "Coração verde"), ("💙", "Coração azul"), ("💜", "Coração roxo"),
            ("🖤", "Coração preto"), ("🤍", "Coração branco"), ("🤎", "Coração marrom"),
            ("💕", "Dois corações"), ("💗", "Coração crescente"), ("💖", "Coração brilhante"),
            ("💝", "Coração com laço"), ("💘", "Coração com flecha"),
            ("🛑", "Sinal de parada"), ("⭕", "Círculo vazio"), ("🚫", "Proibido"),
            ("⛔", "Entrada proibida"), ("❌", "X vermelho"), ("✅", "Check verde"),
            ("🔘", "Botão redondo"), ("🔳", "Botão quadrado"),
            ("◼️", "Quadrado médio preto"), ("◻️", "Quadrado médio branco"),
            ("▪️", "Quadrado pequeno preto"), ("▫️", "Quadrado pequeno branco"),
            ("◾", "Quadrado médio-pequeno preto"), ("◽", "Quadrado médio-pequeno branco"),
            ("✖️", "Multiplicação"), ("➕", "Mais"), ("➖", "Menos"),
            ("➗", "Divisão"), ("☑️", "Caixa de seleção"),
            ("✔️", "Check"), ("💯", "Cem"),
            ("🔹", "Losango pequeno azul"), ("🔸", "Losango pequeno laranja"),
            ("💠", "Losango com bolinha"), ("♻️", "Reciclagem"),
            ("🔞", "18+"),
            # Setas
            ("➡️", "Seta para direita"), ("⬅️", "Seta para esquerda"),
            ("⬆️", "Seta para cima"), ("⬇️", "Seta para baixo"),
            ("↗️", "Seta diagonal cima-direita"), ("↘️", "Seta diagonal baixo-direita"),
            ("↙️", "Seta diagonal baixo-esquerda"), ("↖️", "Seta diagonal cima-esquerda"),
            ("↔️", "Seta horizontal"), ("↕️", "Seta vertical"),
            ("↩️", "Seta curva direita"), ("↪️", "Seta curva esquerda"),
            ("⤴️", "Seta curva cima"), ("⤵️", "Seta curva baixo"),
            ("🔃", "Setas relógio"), ("🔄", "Seta circular"),
            ("🔙", "Voltar seta"), ("🔚", "Fim seta"),
            ("🔛", "Ligado seta"), ("🔜", "Em breve seta"),
            ("🔝", "Topo seta"),
            # Números
            ("0️⃣", "Zero"), ("1️⃣", "Um"), ("2️⃣", "Dois"),
            ("3️⃣", "Três"), ("4️⃣", "Quatro"), ("5️⃣", "Cinco"),
            ("6️⃣", "Seis"), ("7️⃣", "Sete"), ("8️⃣", "Oito"),
            ("9️⃣", "Nove"), ("🔟", "Dez"),
            # Signos zodiacais
            ("♈", "Áries"), ("♉", "Touro"), ("♊", "Gêmeos"),
            ("♋", "Câncer"), ("♌", "Leão"), ("♍", "Virgem"),
            ("♎", "Libra"), ("♏", "Escorpião"), ("♐", "Sagitário"),
            ("♑", "Capricórnio"), ("♒", "Aquário"), ("♓", "Peixes"),
            ("⛎", "Ofiúco"),
            # Pontuação e moedas
            ("‼️", "Dupla exclamação"), ("⁉️", "Exclamação interrogação"),
            ("❓", "Interrogação"), ("❔", "Interrogação branca"),
            ("❕", "Exclamação branca"), ("❗", "Exclamação"),
            ("💲", "Dólar"), ("💱", "Câmbio"),
            # Símbolos religiosos e culturais
            ("☮️", "Paz"), ("✝️", "Cruz"), ("☪️", "Lua e estrela"),
            ("☯️", "Yin Yang"), ("🕉️", "Om"),
            ("🛐", "Local de culto"),
            # Símbolos de aviso
            ("☣️", "Biológico"), ("☢️", "Radioativo"),
            ("⚜️", "Flor-de-lis"),
            # Outros
            ("♿", "Acessibilidade"), ("📛", "Crachá"),
            ("🆗", "OK"), ("🆘", "SOS"), ("🆙", "UP"),
            ("🆕", "Novo"), ("🆓", "Grátis"),
            ("🈁", "Aqui"), ("🈂️", "Taxa"),
            # Mais formas
            ("📶", "Sinal"), ("📳", "Vibração"),
            ("📴", "Desligado"), ("🛐", "Local de culto"),
            ("⚕️", "Símbolo médico"), ("⚰️", "Caixão"),
            ("⚱️", "Urna funerária"), ("🔱", "Tridente"),
            ("〽️", "Alternância"), ("⚠️", "Atenção"),
            ("💱", "Câmbio"), ("💲", "Dólar"),
            # Mais símbolos
            ("©️", "Copyright"), ("®️", "Registrado"),
            ("™️", "Marca registrada"), ("ℹ️", "Informação"),
            ("🔰", "Iniciante"), ("♻️", "Reciclagem"),
            ("💹", "Gráfico alta"), ("📊", "Gráfico barras"),
            ("📈", "Gráfico subindo"), ("📉", "Gráfico descendo"),
            ("🏧", "Caixa eletrônico"), ("🚾", "WC"),
        ],
    },
}

for _cat in EMOJI_CATALOG.values():
    _cat["items"].sort(key=_SORT_KEY)


LETTER_ASSOCIATION = {
    "A": "abelha", "B": "basquete", "C": "cachorro", "D": "dado", "E": "estrela",
    "F": "fogo", "G": "gato", "H": "hospital", "I": "iguana", "J": "jacaré",
    "K": "kiwi", "L": "limão", "M": "maçã", "N": "nota", "O": "olho",
    "P": "pinguim", "Q": "queijo", "R": "rato", "S": "sol", "T": "tartaruga",
    "U": "unicórnio", "V": "vaca", "W": "web", "X": "xícara", "Y": "ioiô", "Z": "zebra",
}


def get_association_for_letter(letter: str) -> str | None:
    return LETTER_ASSOCIATION.get(letter.upper())


def is_emoji_mapped(emoji: str) -> bool:
    all_mapped = set(EMOJI_MAP.values())
    all_mapped.update(SYLLABLE_EMOJI_MAP.values())
    all_mapped.update(WORD_EMOJI_MAP.values())
    return emoji in all_mapped


def get_emoji_for_letter(letter: str) -> str | None:
    return EMOJI_MAP.get(letter.upper())


def get_word_image_query(word: str) -> str:
    return WORD_IMAGE_QUERIES.get(word.lower(), word.lower())


def get_emoji_for_word(word: str) -> str | None:
    return WORD_EMOJI_MAP.get(word.lower().rstrip("."))


def get_emoji_for_syllable(syllable: str) -> str | None:
    key = syllable.upper()
    if key in SYLLABLE_EMOJI_MAP:
        return SYLLABLE_EMOJI_MAP[key]
    return None


def get_emoji_for_text(text: str) -> str | None:
    cleaned = text.lower().strip().rstrip(".!?,")
    emoji = get_emoji_for_word(cleaned)
    if emoji:
        return emoji
    words = cleaned.split()
    for word in words:
        if word.lower() in (
            "o", "a", "os", "as", "um", "uma", "de", "da", "do", "em", "no", "na",
            "meu", "minha", "meus", "minhas", "teu", "tua", "teus", "tuas",
            "seu", "sua", "seus", "suas", "nosso", "nossa", "nossos", "nossas",
            "é", "são", "tem", "têm", "com", "para", "por",
        ):
            continue
        emoji = get_emoji_for_word(word)
        if emoji:
            return emoji
        if len(word) >= 2:
            emoji = get_emoji_for_syllable(word[:2].upper())
            if emoji:
                return emoji
    if len(words):
        emoji = get_emoji_for_syllable(words[0][:2].upper())
        if emoji:
            return emoji
    return None


def build_fallback_image_response(word: str) -> dict:
    emoji = get_emoji_for_word(word)
    if emoji:
        return {
            "type": "emoji",
            "value": emoji,
            "word": word,
        }
    return {
        "type": "emoji",
        "value": "🖼️",
        "word": word,
        "message": "Nenhuma imagem disponível",
    }


async def fetch_unsplash_image(query: str, access_key: str) -> dict | None:
    if not access_key:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.unsplash.com/photos/random",
                params={"query": query, "count": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {access_key}"},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                if data:
                    return {
                        "type": "unsplash",
                        "url": data[0]["urls"]["regular"],
                        "alt": data[0]["alt_description"] or query,
                    }
    except Exception:
        pass
    return None
