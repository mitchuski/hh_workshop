LEX Numeric Fixture.

"Organizer" is a person.
"Trader" is a person.
"Trader Rate" is a number.
"Maximum Members Count" is a number, initially 99.
"Trading Account" is an account.
"Trade Capital" is an amount.
"Fund" is this contract.
"Gains Positive" is a binary.

The Organizer appoints the Trader, appoints the Trading Account, sets the Trader Rate, and fixes the Trade Capital.

CLAUSE: Solvent.
"Solvent" is defined as: the Trade Capital is greater than zero.

CLAUSE: Quorate.
"Quorate" is defined as: the Maximum Members Count is greater than or equal to half of the Trader Rate.

CLAUSE: Report Gains.
The Trader may declare Gains Positive.

CLAUSE: Begin Trading.
The Trader may, if this Fund is Solvent: pay the Trade Capital into escrow.

CLAUSE: Distribute.
The Organizer may, if Gains Positive is declared: pay from escrow the Trade Capital to the Trader.
