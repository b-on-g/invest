namespace $ {

	/** Рабочий baza-master экосистемы bog: bundled seed может указывать на мёртвый хост */
	const master = 'https://baza.87.120.36.150.ip.giper.dev/'
	if( !$giper_baza_yard.masters_default.includes( master ) ) {
		$giper_baza_yard.masters_default.push( master )
	}

	/** Запись одного ребаланса в истории ЛК */
	export class $bog_invest_store_record extends $giper_baza_dict.with({
		Date: $giper_baza_atom_real,
		Quartile: $giper_baza_atom_text,
		Capital: $giper_baza_atom_real,
		Buys: $giper_baza_atom_real,
		Sells: $giper_baza_atom_real,
		Turnover: $giper_baza_atom_real,
	}) {}

	/** Профиль инвестора в home land */
	export class $bog_invest_store_profile extends $giper_baza_dict.with({
		Name: $giper_baza_atom_text,
		Avatar: $giper_baza_atom_link.to( () => $giper_baza_file ),
		Portfolio: $giper_baza_atom_text,
		History: $giper_baza_list_link.to( () => $bog_invest_store_record ),
	}) {}

	/** Data store */
	export class $bog_invest_store extends $mol_object {

		glob() {
			return this.$.$giper_baza_glob
		}

		home_land() {
			return this.glob().home().land()
		}

		profile() {
			return this.home_land().Data( $bog_invest_store_profile )
		}

	}

}
