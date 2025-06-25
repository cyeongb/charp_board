using Microsoft.EntityFrameworkCore;
using BoardBackend.Models;

namespace BoardBackend.Data
{
    // Entity Framework 데이터베이스 컨텍스트
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // 데이터베이스 테이블 정의
        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 사용자 테이블 설정
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.HasIndex(e => e.Email).IsUnique(); // 이메일 중복 방지
                entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).HasColumnName("email").IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).HasColumnName("passwordhash").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("createdAt").HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // 게시판 테이블 설정
            modelBuilder.Entity<Board>(entity =>
            {
                entity.ToTable("boards");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ViewCount).HasDefaultValue(0);

                // 외래키 관계 설정 (사용자와 게시글)
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Boards)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}