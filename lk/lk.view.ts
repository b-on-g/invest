namespace $.$$ {

	const personas = [
		{ min: 0, title: 'Новичок', desc: 'Первый ребаланс — самый страшный. Дальше проще.' },
		{ min: 1, title: 'Дебютант', desc: 'Лёд тронулся: список сделок уже не пугает.' },
		{ min: 4, title: 'Систематизатор', desc: 'Год дисциплины за плечами. Квартальный ритм пойман.' },
		{ min: 8, title: 'Ребалансер', desc: 'Два года без пропусков. Эмоции больше не рулят портфелем.' },
		{ min: 16, title: 'Квант', desc: 'Ты уже сам можешь квартили нарезать. Уважение.' },
	]

	const fmt = ( n: number )=> n.toLocaleString( 'ru-RU', { maximumFractionDigits: 0 } ) + ' ₽'

	export class $bog_invest_lk extends $.$bog_invest_lk {

		profile_data() {
			const home = this.$.$giper_baza_glob.home()
			return home.land().Data( $bog_invest_store_profile )
		}

		@ $mol_mem
		player_id() {
			return this.$.$giper_baza_auth.current().pass().lord().str
		}

		@ $mol_mem
		profile_name( next?: string ) {
			const profile = this.profile_data()
			if( next !== undefined ) {
				profile.Name( 'auto' )?.val( next )
				return next
			}
			return profile.Name()?.val() ?? ''
		}

		@ $mol_mem
		avatar_uri() {
			const files = this.avatar_files()
			if( files.length ) return URL.createObjectURL( files[ 0 ] )

			const profile = this.profile_data()
			const file = profile.Avatar()?.remote()
			if( !file ) return ''
			return file.uri() ?? ''
		}

		@ $mol_mem
		avatar_files( next?: File[] ) {
			if( next?.length ) {
				const profile = this.profile_data()
				const store = profile.Avatar( null )!.ensure( null )
				if( store ) {
					store.blob( next[ 0 ] )
					profile.Avatar( null )!.remote( store )
				}
			}
			return next ?? []
		}

		@ $mol_mem
		avatar_preview() {
			try {
				const uri = this.avatar_uri()
				if( uri ) return this.Avatar_image()
			} catch {}
			return this.Avatar_icon()
		}

		@ $mol_mem
		history() {
			const profile = this.profile_data()
			const list = profile.History()?.remote_list() ?? []
			return list.slice().sort( ( a, b )=> {
				const da = a.Date()?.val() ?? 0
				const db = b.Date()?.val() ?? 0
				return db - da
			} )
		}

		@ $mol_mem
		all_stats() {
			const history = this.history()
			const count = history.length
			const turnover = history.reduce( ( s, r )=> s + ( r.Turnover()?.val() ?? 0 ), 0 )
			const last_capital = history[ 0 ]?.Capital()?.val() ?? 0
			const avg_orders = count
				? Math.round( history.reduce( ( s, r )=> s + ( r.Buys()?.val() ?? 0 ) + ( r.Sells()?.val() ?? 0 ), 0 ) / count )
				: 0
			return [
				String( count ),
				fmt( turnover ),
				last_capital ? fmt( last_capital ) : '—',
				String( avg_orders ),
			]
		}

		@ $mol_mem
		stat_rows() {
			return [ 0, 1, 2, 3 ].map( i=> this.Stat_row( String( i ) ) )
		}

		stat_label( key: string ) {
			const labels = [
				'⚖️ Ребалансов',
				'💸 Суммарный оборот',
				'💰 Последний капитал',
				'📋 Ордеров в среднем',
			]
			return labels[ Number( key ) ] ?? ''
		}

		stat_value( key: string ) {
			return this.all_stats()[ Number( key ) ] ?? '0'
		}

		@ $mol_mem
		persona_text() {
			const count = this.history().length
			let persona = personas[ 0 ]
			for( const p of personas ) {
				if( count >= p.min ) persona = p
			}
			return `${ persona.title } — ${ persona.desc }`
		}

		@ $mol_mem
		history_empty_text() {
			if( this.history().length === 0 ) return 'Пока нет сохранённых ребалансов'
			return ''
		}

		@ $mol_mem
		history_rows() {
			return this.history().map( ( _: unknown, i: number )=> this.History_row( String( i ) ) )
		}

		history_record( key: string ) {
			return this.history()[ Number( key ) ]
		}

		history_name( key: string ) {
			const rec = this.history_record( key )
			const quartile = rec?.Quartile()?.val() ?? '?'
			const capital = rec?.Capital()?.val() ?? 0
			return `${ quartile } · ${ fmt( capital ) }`
		}

		history_details( key: string ) {
			const rec = this.history_record( key )
			const ts = rec?.Date()?.val() ?? 0
			const date = ts ? new Date( ts ).toLocaleDateString( 'ru-RU' ) : ''
			const buys = rec?.Buys()?.val() ?? 0
			const sells = rec?.Sells()?.val() ?? 0
			return `${ date } · продать ${ sells } · купить ${ buys }`
		}

		history_turnover( key: string ) {
			const rec = this.history_record( key )
			return fmt( rec?.Turnover()?.val() ?? 0 )
		}

	}

}
