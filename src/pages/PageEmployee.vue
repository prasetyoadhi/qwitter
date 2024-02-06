<template>
  <q-page>
    <q-page-container class="q-mb-md">
      <div class="q-pa-md">
        <q-form @submit="submitForm">
          <div class="text-h4 q-mb-md">Data Pegawai</div>
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Pribadi</div>
              <q-field label="Nama" v-model="employee.name" disable />

              <!-- Inputan Tambahan -->
              <q-input label="Tanda Penduduk (KTP)" v-model="employee.ktp" />
              <q-uploader
                label="Kartu Keluarga (KK)"
                v-model="employee.kk"
                accept=".pdf, .doc, .docx"
                style="max-width: 300px"
              />
            </q-card-section>
          </q-card>
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Finansial</div>
              <q-input label="NPWP" v-model="employee.npwp" />
              <q-select
                label="Nama Bank"
                v-model="employee.namaBank"
                :options="namaBankOptions"
              />
              <q-input
                label="No. Rekening Bank"
                v-model="employee.bankAccount"
              />
              <br />
              <div v-for="(nobpjs, index) in employee.bpjsHealth" :key="index">
                <q-select
                  label="Hubungan"
                  v-model="employee.hubungankeluarga[index]"
                  :options="hubunganKeluargaOptions"
                />
                <q-input
                  label="Nama Peserta"
                  v-model="employee.namapeserta[index]"
                />
                <q-input label="No BPJS" v-model="employee.bpjsHealth[index]" />
                <q-btn icon="add" @click="addBPJSField" />
                <q-btn
                  v-if="index > 0"
                  icon="delete"
                  @click="removeBPJSField(index)"
                />
              </div>
              <!-- <q-input
                label="Kartu BPJS Kesehatan"
                v-model="employee.bpjsHealth"
              /> -->
            </q-card-section>
          </q-card>
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Kesehatan</div>
              <div
                v-for="(tanggal, index) in employee.selectedTanggalVaksin"
                :key="index"
              >
                <q-select
                  label="Sertifikat Vaksin"
                  v-model="employee.selectedSertifikatVaksin[index]"
                  :options="sertifikatVaksinOptions"
                />
                <q-input
                  filled
                  v-model="employee.selectedTanggalVaksin[index]"
                  mask="date"
                  :rules="['date']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="employee.selectedTanggalVaksin[index]">
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="Close"
                              color="primary"
                              flat
                            />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-btn icon="add" @click="addDateField" />
                <q-btn
                  v-if="index > 0"
                  icon="delete"
                  @click="removeDateField(index)"
                />
              </div>

              <q-input
                label="Surat Keterangan Sehat dari Dokter"
                v-model="employee.keteranganSehat"
              />
              <q-input
                label="Hasil Test Buta Warna dari Dokter"
                v-model="employee.testButaWarna"
              />
            </q-card-section>
          </q-card>
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Pendidikan</div>
              <q-uploader
                label="Ijazah"
                v-model="employee.ijazahFile"
                accept=".pdf, .doc, .docx"
                style="max-width: 300px"
              />

              <q-input
                label="Surat Referensi (Paklaring)"
                v-model="employee.referensi"
              />
            </q-card-section>
          </q-card>
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Data Sertifikat</div>
              <!-- Tanggal Vaksin (Multiple) -->

              <q-input
                label="Sertifikat Pelatihan"
                v-model="employee.sertifikatPelatihan"
              />
              <q-field
                label="Sertifikat Ahli"
                v-model="employee.sertifikatAhli"
              />
            </q-card-section>
          </q-card>
          <q-btn type="submit" label="Simpan" color="primary" />
        </q-form>
      </div>
    </q-page-container>
  </q-page>
</template>
 
<script>
export default {
  data() {
    return {
      employee: {
        name: "",
        position: "",
        salary: null,
        ktp: "",
        kk: "",
        npwp: "",
        namaBank: "",
        bankAccount: "",
        bpjsHealth: [""],
        hubungankeluarga: [],
        namapeserta: [],
        ijazahFile: null, // Menyimpan file Ijazah
        referensi: "",
        keteranganSehat: "",
        testButaWarna: "",
        sertifikatPelatihan: "",
        sertifikatAhli: "",
        tanggalVaksin: null,
        selectedTanggalVaksin: [""],
        selectedSertifikatVaksin: [],
      },
      sertifikatVaksinOptions: [
        // Provide your options here, for example:
        { label: "Covid Dosis 1", value: "1" },
        { label: "Covid Dosis 2", value: "2" },
        // ... (add more options as needed)
      ],
      namaBankOptions: [
        {
          label: "Bank Mandiri",
          value: "1",
        },
        {
          label: "Bank BCA",
          value: "2",
        },
      ],
      hubunganKeluargaOptions: [
        {
          label: "Anak",
          value: "1",
        },
        {
          label: "Istri",
          value: "2",
        },
        {
          label: "Suami",
          value: "3",
        },
      ],
    };
  },
  methods: {
    submitForm() {
      // Lakukan sesuatu dengan data pegawai (simpan ke server, tampilkan pesan, dll.)
      console.log("Data Pegawai:", this.employee);
      // Setelah itu, Anda dapat memilih untuk mengosongkan formulir atau mengarahkan pengguna ke halaman lain
      // this.$router.push('/employees'); // Contoh mengarahkan ke halaman pegawai setelah simpan
    },
    addDateField() {
      this.employee.selectedTanggalVaksin.push("");
      this.employee.selectedSertifikatVaksin.push("");
    },
    removeDateField(index) {
      this.employee.selectedTanggalVaksin.splice(index, 1);
      this.employee.selectedSertifikatVaksin.splice(index, 1);
    },
    addBPJSField() {
      this.employee.hubungankeluarga.push("");
      this.employee.namapeserta.push("");
      this.employee.bpjsHealth.push("");
    },
    removeBPJSField(index) {
      this.employee.hubungankeluarga.splice(index, 1);
      this.employee.namapeserta.splice(index, 1);
      this.employee.bpjsHealth.splice(index, 1);
    },
  },
};
</script>
 
<style scoped>
/* Gaya khusus untuk halaman ini */
.q-mb-md {
  margin-bottom: 20px; /* Sesuaikan margin bottom sesuai kebutuhan Anda */
}

.q-pa-md {
  padding: 20px; /* Sesuaikan padding sesuai kebutuhan Anda */
}
</style>