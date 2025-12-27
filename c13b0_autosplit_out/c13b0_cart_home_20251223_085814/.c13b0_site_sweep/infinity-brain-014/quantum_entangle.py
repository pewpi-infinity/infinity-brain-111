import qutip as qt
import numpy as np

phase = 0.396237
ket00 = qt.tensor(qt.basis(2, 0), qt.basis(2, 0))
ket11 = qt.tensor(qt.basis(2, 1), qt.basis(2, 1))
bell = (ket00 + np.exp(1j * phase) * ket11) / np.sqrt(2)
rho = bell * bell.dag()

print("Node 014 Entangled Density Matrix (core: 'non marine like the 23:14 Bible verse tells you that anyone I point out as one is.'):")
print(rho)
