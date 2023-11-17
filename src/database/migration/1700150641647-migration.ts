import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1700150641647 implements MigrationInterface {
    name = 'Migration1700150641647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "UQ_6019e1e9d4420c594dc5408eb6d"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "UQ_6019e1e9d4420c594dc5408eb6d" UNIQUE ("expiryDate")`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "userId"`);
    }

}
