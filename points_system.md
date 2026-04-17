# 🏏 IPL Auction App - Point System

This document defines the scoring rules used to calculate player points based on match performance.

---

## 🏏 Batting Points

| Action        | Points |
|--------------|--------|
| Run          | +1     |
| Four         | +2     |
| Six          | +4     |
| 50 Runs      | +5     |
| 100 Runs     | +12    |

---

## 🎯 Bowling Points

| Action               | Points |
|----------------------|--------|
| Wicket              | +25    |
| 3 Wickets Bonus     | +8     |
| 5 Wickets Bonus     | +15    |
| Dot Ball            | +1     |
| Maiden Over         | +5     |
| Wicket Maiden Over  | +8     |

---

## 🧤 Fielding Points

| Action                        | Points |
|-------------------------------|--------|
| Catch                         | +8     |
| Run Out (Direct Hit)          | +10    |
| Run Out (Thrower/Receiver)    | +5 each|
| Stumping                      | +8     |

---

## 🧠 Notes

- Bonuses are **in addition to base points**
- Multiple bonuses can apply in a single match
- This system is used to calculate player value in the auction app

---

## 🚀 Example

**Player Performance:**
- 55 runs (includes 5 fours, 2 sixes)
- 1 catch

**Points Calculation:**
- Runs: 55 → +55  
- Fours: 5 × 2 → +10  
- Sixes: 2 × 4 → +8  
- 50 bonus → +5  
- Catch → +8  

**Total = 86 Points**

---