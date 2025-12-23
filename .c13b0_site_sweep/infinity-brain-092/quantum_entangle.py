import qutip as qt
import numpy as np

phase = 2.60384
ket00 = qt.tensor(qt.basis(2, 0), qt.basis(2, 0))
ket11 = qt.tensor(qt.basis(2, 1), qt.basis(2, 1))
bell = (ket00 + np.exp(1j * phase) * ket11) / np.sqrt(2)
rho = bell * bell.dag()

print("Node 092 Entangled Density Matrix (core: 'tax I tax people as NWO and I take it that's why they killed rob reiner.'):")
print(rho)
