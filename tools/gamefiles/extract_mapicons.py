"""Extrai os ícones de marcador do mapa do jogo (atlas de mappins do 2.x, BC7) para web/mapicons/<Variante>.png.

Uso: python -I extract_mapicons.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from atlas_bc7 import part_image  # noqa: E402

# variante (sem "Variant"/"Zzz##_") -> parte do atlas base\gameplay\gui\common\icons\mappin_icons
GIG = 'gigs'   # no 2.x todos os gigs usam o mesmo ícone ("!" na caixa)
MAP = {
    'DefaultQuest': 'quest', 'DynamicEvent': 'dynamic_event', 'Conversation': 'talk',
    'PhoneCall': 'call', 'BountyHunt': GIG, 'Retrieving': GIG, 'Thievery': GIG, 'Sabotage': GIG,
    'ClientInDistress': GIG, 'SOSsignal': GIG, 'Courier': GIG, 'CourierSandboxActivity': 'courier',  # volante (contratos do El Capitan)
    'Convoy': GIG, 'QuestGiver': 'quest_giver', 'ExclamationMark': 'quest_excmark',
    'Fixer': 'fixer', 'NCPDGig': 'map_bounty', 'GangWatch': 'gang_watch',
    'Outpost': 'outpost', 'HiddenStash': 'hidden_stash', 'HuntForPsycho': 'hunt_for_psycho',
    'QuestionMark': 'undiscovered', 'Tarot': 'tarot_card', 'Racing': 'racing',
    'WorldEncounter': 'world_activities', 'RoadBlockade': 'roadblock',
    'RelicDeviceBasic': 'relic_access_point', 'RelicDeviceSpecial': 'relic_access_point',
    'ServicePointDropPoint': 'dropbox', 'ServicePointClothes': 'clothes',
    'ServicePointRipperdoc': 'ripperdoc', 'ServicePointCyberware': 'ripperdoc',
    'ServicePointNetTrainer': 'netservice', 'ServicePointGuns': 'gun',
    'ServicePointMeleeTrainer': 'melee', 'ServicePointMeds': 'medicine',
    'ServicePointFood': 'food_vendor', 'ServicePointBar': 'bar',
    'ServicePointProstitute': 'prostitute', 'ServicePointJunk': 'junk_shop',
    'ServicePointTech': 'tech', 'ServicePointBlackMarket': 'black_market_vendor',
    'ServicePointGlamdoc': 'glamdoc', 'WanderingMerchant': 'wandering_merchant',
    'CarForPurchase': 'car_to_buy', 'MotorcycleForPurchase': 'motorcycle_to_buy',
    'FastTravel': 'fast_travel', 'NCART': 'fast_travel_metro', 'DelamainTaxi': 'delamain',
    'Apartment': 'apartment', 'ApartmentToPurchase': 'apartment_to_buy',
    'PlayerStash': 'V_owned', 'Wardrobe': 'ico_wardrobe',
}


def main():
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'web', 'mapicons')
    os.makedirs(out_dir, exist_ok=True)
    ok = 0
    for variant, part in MAP.items():
        try:
            im = part_image(part)
        except KeyError:
            print('faltando', variant, part)
            continue
        im = im.crop(im.getbbox() or (0, 0, im.width, im.height))
        im.thumbnail((128, 128))
        im.save(os.path.join(out_dir, variant + '.png'))
        ok += 1
    print(f'{ok}/{len(MAP)} ícones em {os.path.normpath(out_dir)}')


if __name__ == '__main__':
    main()
