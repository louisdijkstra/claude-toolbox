#!/bin/sh
# Every band boundary of the circle ramp, plus the inputs that should not crash it.
here=$(dirname "$0")
. "$here/assert.sh"
. "$here/../../hooks/scripts/lib/meter.sh"

# Nearest quarter: 45% is closer to 50 than to 25, so it reads as half full.
assert_eq "$(meter_circle 0)"   "○" "0 is empty"
assert_eq "$(meter_circle 1)"   "○" "1 is empty"
assert_eq "$(meter_circle 12)"  "○" "12 is the top of the empty band"
assert_eq "$(meter_circle 13)"  "◔" "13 rounds up to a quarter"
assert_eq "$(meter_circle 25)"  "◔" "25 is a quarter"
assert_eq "$(meter_circle 37)"  "◔" "37 is the top of the quarter band"
assert_eq "$(meter_circle 38)"  "◑" "38 rounds up to a half"
assert_eq "$(meter_circle 45)"  "◑" "45 is a half"
assert_eq "$(meter_circle 50)"  "◑" "50 is a half"
assert_eq "$(meter_circle 62)"  "◑" "62 is the top of the half band"
assert_eq "$(meter_circle 63)"  "◕" "63 rounds up to three quarters"
assert_eq "$(meter_circle 75)"  "◕" "75 is three quarters"
assert_eq "$(meter_circle 87)"  "◕" "87 is the top of the three-quarter band"
assert_eq "$(meter_circle 88)"  "●" "88 rounds up to full"
assert_eq "$(meter_circle 100)" "●" "100 is full"

assert_eq "$(meter_circle 45.7)" "◑" "a decimal is truncated, not rejected"
assert_eq "$(meter_circle -5)"   "○" "below zero clamps to empty"
assert_eq "$(meter_circle 250)"  "●" "above one hundred clamps to full"
assert_eq "$(meter_circle '')"   "○" "an empty value is empty, not blank output"
assert_eq "$(meter_circle abc)"  "○" "junk is empty, not blank output"

assert_done "meter"
