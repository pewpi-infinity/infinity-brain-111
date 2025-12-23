import qutip as qt
import numpy as np

phase = 3.11329
ket00 = qt.tensor(qt.basis(2, 0), qt.basis(2, 0))
ket11 = qt.tensor(qt.basis(2, 1), qt.basis(2, 1))
bell = (ket00 + np.exp(1j * phase) * ket11) / np.sqrt(2)
rho = bell * bell.dag()

print("Node 110 Entangled Density Matrix (core: 'I don't know really because vanity is sort of illegal except for my family.'):")
print(rho)
