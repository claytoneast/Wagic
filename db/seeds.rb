# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
Card.create(name: 'Heal', type:'CardHeal', price: 15, effect: "20HP for 15G. They'd call that a bargain, back in my day.")
Card.create(name: 'Doubledip', type:'CardDoubledip', price: 30, effect: "Pick letters again this turn. Seems like cheating. Guess it's not.")
Card.create(name: 'Cluster', type:'CardCluster', price: 10, effect: "Ever see an M21 cluster bomb lay into an oil field? Me neither. But watch what it does to the board...")
Card.create(name: 'Switcheroo', type:'CardSwitcheroo', price: 20, effect: "Other guy might have just the letters you want. Probably not. But try it anyway.")
