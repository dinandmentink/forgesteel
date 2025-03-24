import { Monster, MonsterGroup } from '../../models/monster';
import { Navigate, Route, Routes } from 'react-router';
import { Playbook, PlaybookElementKind } from '../../models/playbook';
import { ReactNode, useState } from 'react';
import { Sourcebook, SourcebookElementKind } from '../../models/sourcebook';
import { Ability } from '../../models/ability';
import { AbilityModal } from '../modals/ability/ability-modal';
import { AboutModal } from '../modals/about/about-modal';
import { Adventure } from '../../models/adventure';
import { Ancestry } from '../../models/ancestry';
import { Career } from '../../models/career';
import { Characteristic } from '../../enums/characteristic';
import { Collections } from '../../utils/collections';
import { Complication } from '../../models/complication';
import { Culture } from '../../models/culture';
import { DirectoryModal } from '../modals/directory/directory-modal';
import { Domain } from '../../models/domain';
import { Element } from '../../models/element';
import { ElementModal } from '../modals/element/element-modal';
import { Encounter } from '../../models/encounter';
import { FactoryLogic } from '../../logic/factory-logic';
import { Format } from '../../utils/format';
import { Hero } from '../../models/hero';
import { HeroClass } from '../../models/class';
import { HeroEditPage } from '../pages/heroes/hero-edit/hero-edit-page';
import { HeroExportPage } from '../pages/heroes/hero-export/hero-export-page';
import { HeroListPage } from '../pages/heroes/hero-list/hero-list-page';
import { HeroLogic } from '../../logic/hero-logic';
import { HeroStateModal } from '../modals/hero-state/hero-state-modal';
import { HeroStatePage } from '../../enums/hero-state-page';
import { HeroViewPage } from '../pages/heroes/hero-view/hero-view-page';
import { Item } from '../../models/item';
import { ItemType } from '../../enums/item-type';
import { Kit } from '../../models/kit';
import { LibraryEditPage } from '../pages/library/library-edit/library-edit-page';
import { LibraryListPage } from '../pages/library/library-list/library-list-page';
import { LibraryViewPage } from '../pages/library/library-view/library-view-page';
import { MainLayout } from './main-layout';
import { MiniChecklistModal } from '../modals/mini-checklist/mini-checklist-modal';
import { MonsterModal } from '../modals/monster/monster-modal';
import { Montage } from '../../models/montage';
import { Negotiation } from '../../models/negotiation';
import { Options } from '../../models/options';
import { PDFExport } from '../../utils/pdf-export';
import { Perk } from '../../models/perk';
import { PlaybookEditPage } from '../pages/playbook/playbook-edit/playbook-edit-page';
import { PlaybookListPage } from '../pages/playbook/playbook-list/playbook-list-page';
import { PlaybookLogic } from '../../logic/playbook-logic';
import { PlaybookViewPage } from '../pages/playbook/playbook-view/playbook-view-page';
import { RollModal } from '../modals/roll/roll-modal';
import { RulesModal } from '../modals/rules/rules-modal';
import { SessionPage } from '../pages/session/session-page';
import { SourcebookData } from '../../data/sourcebook-data';
import { SourcebookLogic } from '../../logic/sourcebook-logic';
import { SourcebooksModal } from '../modals/sourcebooks/sourcebooks-modal';
import { Terrain } from '../../models/terrain';
import { TerrainModal } from '../modals/terrain/terrain-modal';
import { Title } from '../../models/title';
import { Utils } from '../../utils/utils';
import { WelcomePage } from '../pages/welcome/welcome-page';
import localforage from 'localforage';
import { useNavigation } from '../../hooks/use-navigation';

import './main.scss';

interface Props {
	heroes: Hero[];
	playbook: Playbook;
	session: Playbook;
	homebrewSourcebooks: Sourcebook[];
	hiddenSourcebookIDs: string[];
	options: Options;
}

export const Main = (props: Props) => {
	const navigation = useNavigation();
	const [ heroes, setHeroes ] = useState<Hero[]>(props.heroes);
	const [ playbook, setPlaybook ] = useState<Playbook>(props.playbook);
	const [ session, setSession ] = useState<Playbook>(props.session);
	const [ homebrewSourcebooks, setHomebrewSourcebooks ] = useState<Sourcebook[]>(props.homebrewSourcebooks);
	const [ hiddenSourcebookIDs, setHiddenSourcebookIDs ] = useState<string[]>(props.hiddenSourcebookIDs);
	const [ options, setOptions ] = useState<Options>(props.options);
	const [ directory, setDirectory ] = useState<ReactNode>(null);
	const [ drawer, setDrawer ] = useState<ReactNode>(null);

	//#region Persistence

	const persistHeroes = (heroes: Hero[]) => {
		return localforage
			.setItem<Hero[]>('forgesteel-heroes', Collections.sort(heroes, h => h.name))
			.then(setHeroes);
	};

	const persistHero = (hero: Hero) => {
		if (heroes.some(h => h.id === hero.id)) {
			const copy = Utils.copy(heroes);
			const list = copy.map(h => h.id === hero.id ? hero : h);

			return persistHeroes(list);
		}
		else {
			const copy = Utils.copy(heroes);
			copy.push(hero);
			Collections.sort(copy, h => h.name);

			return persistHeroes(copy);
		}
	};

	const persistPlaybook = (playbook: Playbook) => {
		return localforage
			.setItem<Playbook>('forgesteel-playbook', playbook)
			.then(setPlaybook);
	};

	const persistSession = (session: Playbook) => {
		return localforage
			.setItem<Playbook>('forgesteel-session', session)
			.then(setSession);
	};

	const persistHomebrewSourcebooks = (homebrew: Sourcebook[]) => {
		return localforage
			.setItem<Sourcebook[]>('forgesteel-homebrew-settings', homebrew)
			.then(setHomebrewSourcebooks);
	};

	const persistHiddenSourcebookIDs = (ids: string[]) => {
		return localforage
			.setItem<string[]>('forgesteel-hidden-setting-ids', ids)
			.then(setHiddenSourcebookIDs);
	};

	const persistOptions = (options: Options) => {
		return localforage
			.setItem<Options>('forgesteel-options', options)
			.then(setOptions);
	};

	//#endregion

	//#region Heroes

	const createHero = () => {
		const hero = FactoryLogic.createHero([
			SourcebookData.core.id,
			SourcebookData.orden.id
		]);

		setDrawer(null);
		persistHero(hero).then(() => navigation.goToHeroEdit(hero.id, 'ancestry'));
	};

	const deleteHero = (hero: Hero) => {
		navigation.goToHeroList();

		const copy = Utils.copy(heroes);
		persistHeroes(copy.filter(h => h.id !== hero.id));
	};

	const saveHero = (hero: Hero) => {
		persistHero(hero).then(() => navigation.goToHeroView(hero.id));
	};

	const importHero = (hero: Hero) => {
		hero.id = Utils.guid();
		HeroLogic.updateHero(hero);

		setDrawer(null);
		persistHero(hero).then(() => navigation.goToHeroView(hero.id));
	};

	const exportHero = (hero: Hero, format: 'image' | 'pdf' | 'json') => {
		Utils.export([ hero.id ], hero.name || 'Unnamed Hero', hero, 'hero', format);
	};

	const exportHeroPDF = (hero: Hero, format: 'portrait' | 'landscape') => {
		PDFExport.startExport(hero, format);
	};

	//#endregion

	//#region Library

	const createLibraryElement = (kind: SourcebookElementKind, sourcebookID: string | null, original: Element | null) => {
		const sourcebook = homebrewSourcebooks.find(cs => cs.id === sourcebookID) || null;
		switch (kind) {
			case 'ancestry':
				createAncestry(original as Ancestry | null, sourcebook);
				break;
			case 'culture':
				createCulture(original as Culture | null, sourcebook);
				break;
			case 'career':
				createCareer(original as Career | null, sourcebook);
				break;
			case 'class':
				createClass(original as HeroClass | null, sourcebook);
				break;
			case 'complication':
				createComplication(original as Complication | null, sourcebook);
				break;
			case 'domain':
				createDomain(original as Domain | null, sourcebook);
				break;
			case 'kit':
				createKit(original as Kit | null, sourcebook);
				break;
			case 'perk':
				createPerk(original as Perk | null, sourcebook);
				break;
			case 'terrain':
				createTerrain(original as Terrain | null, sourcebook);
				break;
			case 'title':
				createTitle(original as Title | null, sourcebook);
				break;
			case 'item':
				createItem(original as Item | null, sourcebook);
				break;
			case 'monster-group':
				createMonsterGroup(original as MonsterGroup | null, sourcebook);
				break;
		}
	};

	const deleteLibraryElement = (kind: SourcebookElementKind, sourcebookID: string, element: Element) => {
		navigation.goToLibraryList(kind);

		const copy = Utils.copy(homebrewSourcebooks);
		const sourcebook = copy.find(cs => cs.id === sourcebookID);
		if (sourcebook) {
			switch (kind) {
				case 'ancestry':
					sourcebook.ancestries = sourcebook.ancestries.filter(x => x.id !== element.id);
					break;
				case 'culture':
					sourcebook.cultures = sourcebook.cultures.filter(x => x.id !== element.id);
					break;
				case 'career':
					sourcebook.careers = sourcebook.careers.filter(x => x.id !== element.id);
					break;
				case 'class':
					sourcebook.classes = sourcebook.classes.filter(x => x.id !== element.id);
					break;
				case 'complication':
					sourcebook.complications = sourcebook.complications.filter(x => x.id !== element.id);
					break;
				case 'domain':
					sourcebook.domains = sourcebook.domains.filter(x => x.id !== element.id);
					break;
				case 'kit':
					sourcebook.kits = sourcebook.kits.filter(x => x.id !== element.id);
					break;
				case 'perk':
					sourcebook.perks = sourcebook.perks.filter(x => x.id !== element.id);
					break;
				case 'terrain':
					sourcebook.terrain = sourcebook.terrain.filter(x => x.id !== element.id);
					break;
				case 'title':
					sourcebook.titles = sourcebook.titles.filter(x => x.id !== element.id);
					break;
				case 'item':
					sourcebook.items = sourcebook.items.filter(x => x.id !== element.id);
					break;
				case 'monster-group':
					sourcebook.monsterGroups = sourcebook.monsterGroups.filter(x => x.id !== element.id);
					break;
			}
		}
		setDrawer(null);
		persistHomebrewSourcebooks(copy);
	};

	const saveLibraryElement = (kind: SourcebookElementKind, sourcebookID: string, element: Element) => {
		const copy = Utils.copy(homebrewSourcebooks);
		const sourcebook = copy.find(cs => cs.id === sourcebookID);
		if (sourcebook) {
			switch (kind) {
				case 'ancestry':
					sourcebook.ancestries = sourcebook.ancestries.map(x => x.id === element.id ? element : x) as Ancestry[];
					break;
				case 'culture':
					sourcebook.cultures = sourcebook.cultures.map(x => x.id === element.id ? element : x) as Culture[];
					break;
				case 'career':
					sourcebook.careers = sourcebook.careers.map(x => x.id === element.id ? element : x) as Career[];
					break;
				case 'class':
					sourcebook.classes = sourcebook.classes.map(x => x.id === element.id ? element : x) as HeroClass[];
					break;
				case 'complication':
					sourcebook.complications = sourcebook.complications.map(x => x.id === element.id ? element : x) as Complication[];
					break;
				case 'domain':
					sourcebook.domains = sourcebook.domains.map(x => x.id === element.id ? element : x) as Domain[];
					break;
				case 'kit':
					sourcebook.kits = sourcebook.kits.map(x => x.id === element.id ? element : x) as Kit[];
					break;
				case 'perk':
					sourcebook.perks = sourcebook.perks.map(x => x.id === element.id ? element : x) as Perk[];
					break;
				case 'terrain':
					sourcebook.terrain = sourcebook.terrain.map(x => x.id === element.id ? element : x) as Terrain[];
					break;
				case 'title':
					sourcebook.titles = sourcebook.titles.map(x => x.id === element.id ? element : x) as Title[];
					break;
				case 'item':
					sourcebook.items = sourcebook.items.map(x => x.id === element.id ? element : x) as Item[];
					break;
				case 'monster-group':
					sourcebook.monsterGroups = sourcebook.monsterGroups.map(x => x.id === element.id ? element : x) as MonsterGroup[];
					break;
			}
		}

		persistHomebrewSourcebooks(copy).then(() => navigation.goToLibraryView(kind, element.id));
	};

	const importLibraryElement = (kind: SourcebookElementKind, sourcebookID: string | null, element: Element) => {
		element.id = Utils.guid();
		if (kind === 'monster-group') {
			const group = element as MonsterGroup;
			group.monsters.forEach(m => m.id === Utils.guid());
		}

		const copy = Utils.copy(homebrewSourcebooks);
		let sourcebook = copy.find(cs => cs.id === sourcebookID);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			copy.push(sourcebook);
		}

		switch (kind) {
			case 'ancestry':
				sourcebook.ancestries.push(element as Ancestry);
				sourcebook.ancestries = Collections.sort<Element>(sourcebook.ancestries, item => item.name) as Ancestry[];
				break;
			case 'culture':
				sourcebook.cultures.push(element as Culture);
				sourcebook.cultures = Collections.sort<Element>(sourcebook.cultures, item => item.name) as Culture[];
				break;
			case 'career':
				sourcebook.careers.push(element as Career);
				sourcebook.careers = Collections.sort<Element>(sourcebook.careers, item => item.name) as Career[];
				break;
			case 'class':
				sourcebook.classes.push(element as HeroClass);
				sourcebook.classes = Collections.sort<Element>(sourcebook.classes, item => item.name) as HeroClass[];
				break;
			case 'complication':
				sourcebook.complications.push(element as Complication);
				sourcebook.complications = Collections.sort<Element>(sourcebook.complications, item => item.name) as Complication[];
				break;
			case 'domain':
				sourcebook.domains.push(element as Domain);
				sourcebook.domains = Collections.sort<Element>(sourcebook.domains, item => item.name) as Domain[];
				break;
			case 'kit':
				sourcebook.kits.push(element as Kit);
				sourcebook.kits = Collections.sort<Element>(sourcebook.kits, item => item.name) as Kit[];
				break;
			case 'perk':
				sourcebook.perks.push(element as Perk);
				sourcebook.perks = Collections.sort<Element>(sourcebook.perks, item => item.name) as Perk[];
				break;
			case 'terrain':
				sourcebook.terrain.push(element as Terrain);
				sourcebook.terrain = Collections.sort<Element>(sourcebook.terrain, item => item.name) as Terrain[];
				break;
			case 'title':
				sourcebook.titles.push(element as Title);
				sourcebook.titles = Collections.sort<Element>(sourcebook.titles, item => item.name) as Title[];
				break;
			case 'item':
				sourcebook.items.push(element as Item);
				sourcebook.items = Collections.sort<Element>(sourcebook.items, item => item.name) as Item[];
				break;
			case 'monster-group':
				sourcebook.monsterGroups.push(element as MonsterGroup);
				sourcebook.monsterGroups = Collections.sort<Element>(sourcebook.monsterGroups, item => item.name) as MonsterGroup[];
				break;
		}

		SourcebookLogic.updateSourcebook(sourcebook);

		setDrawer(null);
		persistHomebrewSourcebooks(copy).then(() => navigation.goToLibraryList(kind));
	};

	const exportLibraryElement = (kind: SourcebookElementKind, element: Element, format: 'image' | 'pdf' | 'json') => {
		let name: string;
		let extension: string;

		switch (kind) {
			case 'monster-group':
				name = 'Monster Group';
				extension = 'monster-group';
				break;
			default:
				name = Format.capitalize(kind);
				extension = kind;
				break;
		};

		Utils.export([ element.id ], element.name || name, element, extension, format);
	};

	const createAncestry = (original: Ancestry | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let ancestry: Ancestry;
		if (original) {
			ancestry = Utils.copy(original);
			ancestry.id = Utils.guid();
		} else {
			ancestry = FactoryLogic.createAncestry();
		}

		sourcebook.ancestries.push(ancestry);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('ancestry', sourcebook.id, ancestry.id));
	};

	const createCulture = (original: Culture | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let culture: Culture;
		if (original) {
			culture = Utils.copy(original);
			culture.id = Utils.guid();
		} else {
			culture = FactoryLogic.createCulture();
		}

		sourcebook.cultures.push(culture);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('culture', sourcebook.id, culture.id));
	};

	const createCareer = (original: Career | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let career: Career;
		if (original) {
			career = Utils.copy(original);
			career.id = Utils.guid();
		} else {
			career = FactoryLogic.createCareer();
		}

		sourcebook.careers.push(career);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('career', sourcebook.id, career.id));
	};

	const createClass = (original: HeroClass | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let heroClass: HeroClass;
		if (original) {
			heroClass = Utils.copy(original);
			heroClass.id = Utils.guid();

			// Make sure this has 10 levels
			while (heroClass.featuresByLevel.length < 10) {
				heroClass.featuresByLevel.push({
					level: heroClass.featuresByLevel.length + 1,
					features: []
				});
			}
			heroClass.subclasses.forEach(sc => {
				while (sc.featuresByLevel.length < 10) {
					sc.featuresByLevel.push({
						level: sc.featuresByLevel.length + 1,
						features: []
					});
				}
			});
		} else {
			heroClass = FactoryLogic.createClass();
		}

		sourcebook.classes.push(heroClass);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('class', sourcebook.id, heroClass.id));
	};

	const createComplication = (original: Complication | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let complication: Complication;
		if (original) {
			complication = Utils.copy(original);
			complication.id = Utils.guid();
		} else {
			complication = FactoryLogic.createComplication();
		}

		sourcebook.complications.push(complication);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('complication', sourcebook.id, complication.id));
	};

	const createDomain = (original: Domain | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let domain: Domain;
		if (original) {
			domain = Utils.copy(original);
			domain.id = Utils.guid();

			// Make sure this has 10 levels
			while (domain.featuresByLevel.length < 10) {
				domain.featuresByLevel.push({
					level: domain.featuresByLevel.length + 1,
					features: []
				});
			}
		} else {
			domain = FactoryLogic.createDomain();
		}

		sourcebook.domains.push(domain);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('domain', sourcebook.id, domain.id));
	};

	const createKit = (original: Kit | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let kit: Kit;
		if (original) {
			kit = Utils.copy(original);
			kit.id = Utils.guid();
		} else {
			kit = FactoryLogic.createKit();
		}

		sourcebook.kits.push(kit);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('kit', sourcebook.id, kit.id));
	};

	const createPerk = (original: Perk | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let perk: Perk;
		if (original) {
			perk = Utils.copy(original);
			perk.id = Utils.guid();
		} else {
			perk = FactoryLogic.createPerk();
		}

		sourcebook.perks.push(perk);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('perk', sourcebook.id, perk.id));
	};

	const createTitle = (original: Title | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let title: Title;
		if (original) {
			title = Utils.copy(original);
			title.id = Utils.guid();
		} else {
			title = FactoryLogic.createTitle();
		}

		sourcebook.titles.push(title);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('title', sourcebook.id, title.id));
	};

	const createItem = (original: Item | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let item: Item;
		if (original) {
			item = Utils.copy(original);
			item.id = Utils.guid();
		} else {
			item = FactoryLogic.createItem({
				id: Utils.guid(),
				name: '',
				description: '',
				type: ItemType.Consumable,
				crafting: FactoryLogic.createProject({})
			});
		}

		sourcebook.items.push(item);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('item', sourcebook.id, item.id));
	};

	const createMonsterGroup = (original: MonsterGroup | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let monsterGroup: MonsterGroup;
		if (original) {
			monsterGroup = Utils.copy(original);
			monsterGroup.id = Utils.guid();
			monsterGroup.monsters.forEach(m => m.id = Utils.guid());
		} else {
			monsterGroup = FactoryLogic.createMonsterGroup();
		}

		sourcebook.monsterGroups.push(monsterGroup);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('monster-group', sourcebook.id, monsterGroup.id));
	};

	const createTerrain = (original: Terrain | null, sourcebook: Sourcebook | null) => {
		const sourcebooks = Utils.copy(homebrewSourcebooks);
		if (!sourcebook) {
			sourcebook = FactoryLogic.createSourcebook();
			sourcebooks.push(sourcebook);
		} else {
			const id = sourcebook.id;
			sourcebook = sourcebooks.find(cs => cs.id === id) as Sourcebook;
		}

		let terrain: Terrain;
		if (original) {
			terrain = Utils.copy(original);
			terrain.id = Utils.guid();
		} else {
			terrain = FactoryLogic.createTerrain();
		}

		sourcebook.terrain.push(terrain);
		persistHomebrewSourcebooks(sourcebooks).then(() => navigation.goToLibraryEdit('terrain', sourcebook.id, terrain.id));
	};

	//#endregion

	//#region Playbook

	const createPlaybookElement = (kind: PlaybookElementKind, original: Element | null) => {
		const copy = Utils.copy(playbook);
		let element: Element;

		switch (kind) {
			case 'adventure':
				if (original) {
					element = Utils.copy(original);
					element.id = Utils.guid();
				} else {
					element = FactoryLogic.createAdventure();
					(element as Adventure).party.count = options.heroCount;
					(element as Adventure).party.level = options.heroLevel;
				}
				copy.adventures.push(element as Adventure);
				break;
			case 'encounter':
				if (original) {
					element = Utils.copy(original);
					element.id = Utils.guid();
				} else {
					element = FactoryLogic.createEncounter();
				}
				copy.encounters.push(element as Encounter);
				break;
			case 'montage':
				if (original) {
					element = Utils.copy(original);
					element.id = Utils.guid();
				} else {
					element = FactoryLogic.createMontage();
				}
				copy.montages.push(element as Montage);
				break;
			case 'negotiation':
				if (original) {
					element = Utils.copy(original);
					element.id = Utils.guid();
				} else {
					element = FactoryLogic.createNegotiation();
				}
				copy.negotiations.push(element as Negotiation);
				break;
		}

		persistPlaybook(copy).then(() => navigation.goToPlaybookView(kind, element.id));
	};

	const deletePlaybookElement = (kind: PlaybookElementKind, element: Element) => {
		navigation.goToPlaybookList(kind);

		const copy = Utils.copy(playbook);
		switch (kind) {
			case 'adventure':
				copy.adventures = copy.adventures.filter(x => x.id !== element.id);
				break;
			case 'encounter':
				copy.encounters = copy.encounters.filter(x => x.id !== element.id);
				break;
			case 'montage':
				copy.montages = copy.montages.filter(x => x.id !== element.id);
				break;
			case 'negotiation':
				copy.negotiations = copy.negotiations.filter(x => x.id !== element.id);
				break;
		}

		setDrawer(null);
		persistPlaybook(copy);
	};

	const savePlaybookElement = (kind: PlaybookElementKind, element: Element) => {
		const copy = Utils.copy(playbook);
		switch (kind) {
			case 'adventure':
				copy.adventures = copy.adventures.map(x => x.id === element.id ? element : x) as Adventure[];
				break;
			case 'encounter':
				copy.encounters = copy.encounters.map(x => x.id === element.id ? element : x) as Encounter[];
				break;
			case 'montage':
				copy.montages = copy.montages.map(x => x.id === element.id ? element : x) as Montage[];
				break;
			case 'negotiation':
				copy.negotiations = copy.negotiations.map(x => x.id === element.id ? element : x) as Negotiation[];
				break;
		}

		persistPlaybook(copy).then(() => navigation.goToPlaybookView(kind, element.id));
	};

	const importPlaybookElement = (kind: PlaybookElementKind, element: Element) => {
		element.id = Utils.guid();

		const copy = Utils.copy(playbook);
		switch (kind) {
			case 'adventure':
				copy.adventures.push(element as Adventure);
				copy.adventures = Collections.sort<Element>(copy.adventures, item => item.name) as Adventure[];
				break;
			case 'encounter':
				copy.encounters.push(element as Encounter);
				copy.encounters = Collections.sort<Element>(copy.encounters, item => item.name) as Encounter[];
				break;
			case 'montage':
				copy.montages.push(element as Montage);
				copy.montages = Collections.sort<Element>(copy.montages, item => item.name) as Montage[];
				break;
			case 'negotiation':
				copy.negotiations.push(element as Negotiation);
				copy.negotiations = Collections.sort<Element>(copy.negotiations, item => item.name) as Negotiation[];
				break;
		}

		PlaybookLogic.updatePlaybook(copy);

		setDrawer(null);
		persistPlaybook(copy).then(() => navigation.goToPlaybookList(kind));
	};

	const exportPlaybookElement = (kind: PlaybookElementKind, element: Element, format: 'image' | 'pdf' | 'json') => {
		Utils.export([ element.id ], element.name || Format.capitalize(kind), element, kind, format);
	};

	const startPlaybookElement = (kind: PlaybookElementKind, element: Element) => {
		const sessionCopy = Utils.copy(session);
		let e: Element;

		switch (kind) {
			case 'encounter': {
				e = PlaybookLogic.startEncounter(element as Encounter, [ SourcebookData.core, SourcebookData.orden, ...homebrewSourcebooks ], options);
				sessionCopy.encounters.push(e as Encounter);
				break;
			}
			case 'montage': {
				e = PlaybookLogic.startMontage(element as Montage);
				sessionCopy.montages.push(e as Montage);
				break;
			}
			case 'negotiation': {
				e = PlaybookLogic.startNegotiation(element as Negotiation);
				sessionCopy.negotiations.push(e as Negotiation);
				break;
			}
		}

		persistSession(sessionCopy).then(() => navigation.goToSession(e.id));
	};

	//#endregion

	//#region Session

	//

	//#endregion

	//#region Modals

	const showDirectoryPane = () => {
		setDirectory(
			<DirectoryModal
				heroes={heroes}
				sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
				playbook={playbook}
				onClose={() => setDirectory(null)}
			/>
		);
	};

	const showAbout = () => {
		setDrawer(
			<AboutModal
				onClose={() => setDrawer(null)}
			/>
		);
	};

	const showRoll = () => {
		setDrawer(
			<RollModal
				onClose={() => setDrawer(null)}
			/>
		);
	};

	const onSelectLibraryElement = (element: Element, kind: SourcebookElementKind) => {
		setDrawer(
			<ElementModal
				kind={kind}
				element={element}
				options={options}
				onClose={() => setDrawer(null)}
				export={format => exportLibraryElement(kind, element, format)}
			/>
		);
	};

	const onSelectMonster = (monster: Monster, monsterGroup?: MonsterGroup) => {
		setDrawer(
			<MonsterModal
				monster={monster}
				monsterGroup={monsterGroup}
				options={options}
				onClose={() => setDrawer(null)}
				export={format => Utils.export([ monster.id ], monster.name || 'Monster', monster, 'monster', format)}
			/>
		);
	};

	const onSelectTerrain = (terrain: Terrain, upgradeIDs: string[]) => {
		setDrawer(
			<TerrainModal
				terrain={terrain}
				upgradeIDs={upgradeIDs}
				onClose={() => setDrawer(null)}
				export={format => Utils.export([ terrain.id ], terrain.name || 'Terrain', terrain, 'terrain', format)}
			/>
		);
	};

	const onSelectCharacteristic = (characteristic: Characteristic, hero: Hero) => {
		setDrawer(
			<RollModal
				characteristics={[ characteristic ]}
				hero={hero}
				onClose={() => setDrawer(null)}
			/>
		);
	};

	const onSelectAbility = (ability: Ability, hero: Hero) => {
		setDrawer(
			<AbilityModal
				ability={ability}
				hero={hero}
				onClose={() => setDrawer(null)}
				updateHero={persistHero}
			/>
		);
	};

	const onShowHeroState = (hero: Hero, page: HeroStatePage) => {
		setDrawer(
			<HeroStateModal
				hero={hero}
				sourcebooks={[ SourcebookData.core, SourcebookData.orden, ...homebrewSourcebooks ]}
				options={options}
				startPage={page}
				onClose={() => setDrawer(null)}
				onChange={persistHero}
				onLevelUp={() => {
					if (hero && hero.class) {
						hero.class.level += 1;
						setDrawer(null);
						persistHero(hero).then(() => navigation.goToHeroEdit(hero.id, 'class'));
					}
				}}
			/>
		);
	};

	const onShowRules = (hero: Hero) => {
		setDrawer(
			<RulesModal
				hero={hero}
				sourcebooks={[ SourcebookData.core, SourcebookData.orden, ...homebrewSourcebooks ]}
				onClose={() => setDrawer(null)}
			/>
		);
	};

	const showSourcebooks = () => {
		setDrawer(
			<SourcebooksModal
				heroes={heroes}
				officialSourcebooks={[ SourcebookData.core, SourcebookData.orden ]}
				homebrewSourcebooks={homebrewSourcebooks}
				hiddenSourcebookIDs={hiddenSourcebookIDs}
				onClose={() => setDrawer(null)}
				onHomebrewSourcebookChange={persistHomebrewSourcebooks}
				onHiddenSourcebookIDsChange={persistHiddenSourcebookIDs}
			/>
		);
	};

	const showMiniChecklist = (encounter: Encounter) => {
		setDrawer(
			<MiniChecklistModal
				encounter={encounter}
				sourcebooks={[ SourcebookData.core, SourcebookData.orden, ...homebrewSourcebooks ]}
				options={options}
				onClose={() => setDrawer(null)}
			/>
		);
	};

	//#endregion

	return (
		<Routes>
			<Route
				path='/'
				element={
					<MainLayout
						section='hero'
						directory={directory}
						drawer={drawer}
						setDirectory={setDirectory}
						setDrawer={setDrawer}
					/>
				}
			>
				<Route
					index={true}
					element={
						<WelcomePage
							showDirectory={showDirectoryPane}
							showAbout={showAbout}
							showRoll={showRoll}
						/>
					}
				/>
				<Route path='hero'>
					<Route
						index={true}
						path=':folder?'
						element={
							<HeroListPage
								heroes={heroes}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={props.options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								addHero={createHero}
								importHero={importHero}
							/>
						}
					/>
					<Route
						path='view/:heroID'
						element={
							<HeroViewPage
								heroes={heroes}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								setOptions={persistOptions}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								exportHero={exportHero}
								exportHeroPDF={exportHeroPDF}
								deleteHero={deleteHero}
								showAncestry={ancestry => onSelectLibraryElement(ancestry, 'ancestry')}
								showCulture={culture => onSelectLibraryElement(culture, 'culture')}
								showCareer={career => onSelectLibraryElement(career, 'career')}
								showClass={heroClass => onSelectLibraryElement(heroClass, 'class')}
								showComplication={complication => onSelectLibraryElement(complication, 'complication')}
								showDomain={domain => onSelectLibraryElement(domain, 'domain')}
								showKit={kit => onSelectLibraryElement(kit, 'kit')}
								showCompanion={onSelectMonster}
								showCharacteristic={onSelectCharacteristic}
								showAbility={onSelectAbility}
								showHeroState={onShowHeroState}
								showRules={onShowRules}
							/>
						}
					/>
					<Route
						path='edit/:heroID'
						element={<Navigate to='ancestry' replace={true} />}
					/>
					<Route
						path='edit/:heroID/:page'
						element={
							<HeroEditPage
								heroes={heroes}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								saveChanges={saveHero}
							/>
						}
					/>
					<Route
						path='export/:heroID'
						element={<HeroExportPage heroes={heroes} />}
					/>
				</Route>
				<Route path='library'>
					<Route
						index={true}
						element={<Navigate to='ancestry' replace={true} />}
					/>
					<Route
						path=':kind'
						element={
							<LibraryListPage
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								hiddenSourcebookIDs={hiddenSourcebookIDs}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								setOptions={persistOptions}
								showSourcebooks={showSourcebooks}
								createElement={(kind, sourcebookID) => createLibraryElement(kind, sourcebookID, null)}
								importElement={importLibraryElement}
							/>
						}
					/>
					<Route
						path='view/:kind/:elementID/:subElementID?'
						element={
							<LibraryViewPage
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								playbook={playbook}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								createElement={createLibraryElement}
								export={exportLibraryElement}
								delete={deleteLibraryElement}
							/>
						}
					/>
					<Route
						path='edit/:kind/:sourcebookID/:elementID/:subElementID?'
						element={
							<LibraryEditPage
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								showMonster={onSelectMonster}
								saveChanges={saveLibraryElement}
								setOptions={persistOptions}
							/>
						}
					/>
				</Route>
				<Route path='playbook'>
					<Route
						index={true}
						element={<Navigate to='adventure' replace={true} />}
					/>
					<Route
						path=':kind'
						element={
							<PlaybookListPage
								playbook={playbook}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								createElement={createPlaybookElement}
								importElement={importPlaybookElement}
								setOptions={persistOptions}
							/>
						}
					/>
					<Route
						path='view/:kind/:elementID'
						element={
							<PlaybookViewPage
								playbook={playbook}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								showMiniChecklist={showMiniChecklist}
								export={exportPlaybookElement}
								start={startPlaybookElement}
								delete={deletePlaybookElement}
								setOptions={persistOptions}
							/>
						}
					/>
					<Route
						path='edit/:kind/:elementID'
						element={
							<PlaybookEditPage
								playbook={playbook}
								sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
								options={options}
								showDirectory={showDirectoryPane}
								showAbout={showAbout}
								showRoll={showRoll}
								showMonster={onSelectMonster}
								showTerrain={onSelectTerrain}
								saveChanges={savePlaybookElement}
								setOptions={persistOptions}
							/>
						}
					/>
				</Route>
				<Route
					path='session/:elementID?'
					element={
						<SessionPage
							session={session}
							playbook={playbook}
							sourcebooks={SourcebookLogic.getSourcebooks(homebrewSourcebooks)}
							options={options}
							showDirectory={showDirectoryPane}
							showAbout={showAbout}
							showRoll={showRoll}
							updateSession={persistSession}
						/>
					}
				/>
			</Route>
		</Routes>
	);
};
